/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.deleteCryptoPortfolios = functions.firestore
  .document("commands/{commandId}")
  .onCreate(async (snap) => {
    const commandData = snap.data();

    // Only execute if the command name is "deleteCryptoPortfolios"
    if (commandData.name !== "deleteCryptoPortfolios") {
      return null;
    }

    try {
      const portfoliosCollection = firestore.collection("portfolios");
      const tagCountsRef = firestore
        .collection("tagCounts")
        .doc("portfolioCategory");

      // ✅ Step 1: Fetch all portfolios
      const portfoliosSnapshot = await portfoliosCollection.get();
      let deletedPortfolios = [];
      let tickersToUpdate = new Map(); // Tracks all tickers that need updates

      // ✅ Step 2: Identify and delete portfolios with BTC-USD or ETH-USD
      const deletePortfolioPromises = portfoliosSnapshot.docs.map(
        async (portfolioDoc) => {
          const portfolioData = portfolioDoc.data();

          if (
            !portfolioData.holdings ||
            !Array.isArray(portfolioData.holdings)
          ) {
            return;
          }

          // Check if portfolio contains BTC-USD or ETH-USD
          const containsCrypto = portfolioData.holdings.some(
            (holding) =>
              holding.ticker === "BTC-USD" || holding.ticker === "ETH-USD",
          );

          if (containsCrypto) {
            deletedPortfolios.push(portfolioData);

            console.log(
              `Deleting portfolio: ${portfolioData.name} (ID: ${portfolioDoc.id})`,
            );

            // Track all tickers in this portfolio for count reduction
            portfolioData.holdings.forEach((holding) => {
              tickersToUpdate.set(
                holding.ticker,
                (tickersToUpdate.get(holding.ticker) || 0) + 1,
              );
            });

            return portfolioDoc.ref.delete();
          }
        },
      );

      await Promise.all(deletePortfolioPromises);

      console.log(
        `Deleted ${deletedPortfolios.length} crypto-related portfolios.`,
      );

      // ✅ Step 3: Update `tagCounts.portfolioCategory`
      if (deletedPortfolios.length > 0) {
        const tagCountsDoc = await tagCountsRef.get();
        let tagCountsData = tagCountsDoc.exists
          ? tagCountsDoc.data()
          : { categories: {}, tickerCounts: [] };

        // Update category counts
        deletedPortfolios.forEach((portfolio) => {
          const category = portfolio.category.toLowerCase();
          if (tagCountsData.categories[category]) {
            tagCountsData.categories[category] = Math.max(
              0,
              tagCountsData.categories[category] - 1,
            );
          }
        });

        // ✅ Step 4: Update `tagCounts.tickerCounts`
        tagCountsData.tickerCounts = tagCountsData.tickerCounts.map(
          (tickerObj) => {
            if (tickersToUpdate.has(tickerObj.ticker)) {
              return {
                ...tickerObj,
                count: Math.max(
                  0,
                  tickerObj.count - tickersToUpdate.get(tickerObj.ticker),
                ),
              };
            }
            return tickerObj;
          },
        );

        // Remove tickers with a count of 0
        tagCountsData.tickerCounts = tagCountsData.tickerCounts.filter(
          (tickerObj) => tickerObj.count > 0,
        );

        // ✅ Step 5: Save updated `tagCounts`
        await tagCountsRef.set(tagCountsData, { merge: true });

        console.log(
          "Updated `portfolioCategory` and `tickerCounts` after deletion.",
        );
      }

      return null;
    } catch (error) {
      console.error(
        "Error during crypto portfolio deletion and tagCount update:",
        error,
      );
    }
  });
