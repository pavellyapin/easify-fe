/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.onPortfolioCreateOrUpdate = functions.firestore
  .document("users/{userId}/portfolios/{portfolioId}")
  .onWrite(async (change, context) => {
    const beforePortfolio = change.before.exists ? change.before.data() : null;
    const afterPortfolio = change.after.exists ? change.after.data() : null;
    const portfolioId = context.params.portfolioId;
    const userId = context.params.userId;

    if (!afterPortfolio) {
      console.error("No portfolio data available");
      return;
    }

    console.log("User ID:", userId);
    console.log("Before portfolio Data:", JSON.stringify(beforePortfolio));
    console.log("After portfolio Data:", JSON.stringify(afterPortfolio));

    try {
      const statsRef = firestore
        .collection("users")
        .doc(userId)
        .collection("stats")
        .doc("portfolioStats");
      const statsDoc = await statsRef.get();
      let portfolioStats = statsDoc.data() || {
        inProgressPortfolios: 0,
        completePortfolios: 0,
        completeRiskLevelCounts: {
          low: 0,
          moderate: 0,
          high: 0,
        },
        inProgressRiskLevelCounts: {
          low: 0,
          moderate: 0,
          high: 0,
        },
        inProgressCategoryCounts: {},
        completedCategoryCounts: {},
      };

      console.log("Current Portfolio Stats:", JSON.stringify(portfolioStats));

      const portfolioCategory =
        afterPortfolio.portfolio.category.toLowerCase() || "general";
      const portfolioRiskLevel = (
        afterPortfolio.portfolio.riskLevel || "moderate"
      ).toLowerCase();

      console.log("Portfolio Category:", portfolioCategory);
      console.log("Portfolio Risk Level:", portfolioRiskLevel);

      // Check if portfolio is complete
      const isComplete =
        afterPortfolio.progress?.assetClass?.every(
          (asset) => asset.complete === true,
        ) ?? false;

      if (!beforePortfolio) {
        console.log("New portfolio detected.");
        portfolioStats.inProgressPortfolios += 1;

        // Increment category count
        portfolioStats.inProgressCategoryCounts[portfolioCategory] =
          (portfolioStats.inProgressCategoryCounts[portfolioCategory] || 0) + 1;

        // Increment risk level count
        portfolioStats.inProgressRiskLevelCounts[portfolioRiskLevel] =
          (portfolioStats.inProgressRiskLevelCounts[portfolioRiskLevel] || 0) +
          1;

        console.log(`Updated category count: ${portfolioCategory}`);
        console.log(`Updated risk level count: ${portfolioRiskLevel}`);
      }

      // Handle portfolio completion status update
      if (beforePortfolio) {
        const wasComplete =
          beforePortfolio.progress?.assetClass?.every(
            (asset) => asset.complete === true,
          ) ?? false;

        if (!wasComplete && isComplete) {
          console.log(`Portfolio ${portfolioId} has been completed.`);

          await change.after.ref.update({ status: "completed" });

          portfolioStats.inProgressPortfolios =
            portfolioStats.inProgressPortfolios - 1;
          // Move from in-progress to completed
          portfolioStats.inProgressCategoryCounts[portfolioCategory] = Math.max(
            0,
            (portfolioStats.inProgressCategoryCounts[portfolioCategory] || 0) -
              1,
          );
          portfolioStats.inProgressRiskLevelCounts[portfolioRiskLevel] =
            Math.max(
              0,
              (portfolioStats.inProgressRiskLevelCounts[portfolioRiskLevel] ||
                0) - 1,
            );

          portfolioStats.completePortfolios += 1;
          portfolioStats.completedCategoryCounts[portfolioCategory] =
            (portfolioStats.completedCategoryCounts[portfolioCategory] || 0) +
            1;
          portfolioStats.completeRiskLevelCounts[portfolioRiskLevel] =
            (portfolioStats.completeRiskLevelCounts[portfolioRiskLevel] || 0) +
            1;

          // 🔔 **Send Notification on Portfolio Completion**
          if (userId) {
            const notificationsRef = firestore
              .collection("users")
              .doc(userId)
              .collection("notifications");

            const notification = {
              type: "portfolio",
              title: "Portfolio Completed!",
              message: `Congratulations on completing your portfolio: ${afterPortfolio.name}!`,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              isRead: false,
            };

            await notificationsRef.add(notification);
            console.log(`Completion notification added for user: ${userId}`);
          }
        }
      }

      // Store the updated portfolio stats back in Firestore
      await statsRef.set(portfolioStats, { merge: true });

      console.log(
        "Final Updated Portfolio Stats:",
        JSON.stringify(portfolioStats),
      );
      console.log(`Portfolio stats updated for portfolio ${portfolioId}`);
    } catch (error) {
      console.error("Error updating portfolio stats:", error);
    }
  });
