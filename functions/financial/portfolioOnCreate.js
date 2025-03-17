/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.portfolioOnCreate = functions.firestore
  .document("portfolios/{portfolioId}")
  .onCreate(async (snap) => {
    const portfolioData = snap.data();

    // Normalize data
    const tags = (portfolioData.tags || []).map((tag) => tag.toLowerCase());
    const category = (portfolioData.category || "uncategorized").toLowerCase();
    let riskLevel = (portfolioData.riskLevel || "low").toLowerCase();

    // Validate riskLevel
    const validRiskLevels = ["low", "moderate", "high"];
    if (!validRiskLevels.includes(riskLevel)) {
      console.warn(
        `Invalid riskLevel "${riskLevel}" provided. Defaulting to "low".`,
      );
      riskLevel = "low";
    }

    const holdings = portfolioData.holdings || [];

    try {
      const tagCountsRef = firestore
        .collection("tagCounts")
        .doc("portfolioTags");
      const categoryCountsRef = firestore
        .collection("tagCounts")
        .doc("portfolioCategories");
      const tickerCountsRef = firestore
        .collection("tagCounts")
        .doc("tickerCounts");

      const [tagCountsDoc, categoryCountsDoc, tickerCountsDoc] =
        await Promise.all([
          tagCountsRef.get(),
          categoryCountsRef.get(),
          tickerCountsRef.get(),
        ]);

      let tagCounts = tagCountsDoc.exists ? tagCountsDoc.data().tags : [];
      let categoryCounts = categoryCountsDoc.exists
        ? categoryCountsDoc.data().categories
        : [];
      let tickerCounts = tickerCountsDoc.exists
        ? tickerCountsDoc.data().tickers
        : [];

      // Convert arrays of objects to maps for easier manipulation
      const tagCountsMap = new Map(
        tagCounts.map((item) => [item.tag, item.count]),
      );
      const categoryCountsMap = new Map(
        categoryCounts.map((item) => [item.category, item.count]),
      );
      const tickerCountsMap = new Map(
        tickerCounts.map((item) => [item.ticker, item.count]),
      );

      // Update tag counts
      tags.forEach((tag) => {
        if (tagCountsMap.has(tag)) {
          tagCountsMap.set(tag, tagCountsMap.get(tag) + 1);
        } else {
          tagCountsMap.set(tag, 1);
        }
      });

      // Update category counts
      if (categoryCountsMap.has(category)) {
        categoryCountsMap.set(category, categoryCountsMap.get(category) + 1);
      } else {
        categoryCountsMap.set(category, 1);
      }

      // Update ticker counts
      holdings.forEach((holding) => {
        if (holding.ticker) {
          const normalizedTicker = holding.ticker.toUpperCase(); // Normalize ticker to uppercase
          if (tickerCountsMap.has(normalizedTicker)) {
            tickerCountsMap.set(
              normalizedTicker,
              tickerCountsMap.get(normalizedTicker) + 1,
            );
          } else {
            tickerCountsMap.set(normalizedTicker, 1);
          }
        }
      });

      // Convert maps back to sorted arrays of objects
      tagCounts = Array.from(tagCountsMap, ([tag, count]) => ({ tag, count }));
      categoryCounts = Array.from(categoryCountsMap, ([category, count]) => ({
        category,
        count,
      }));
      tickerCounts = Array.from(tickerCountsMap, ([ticker, count]) => ({
        ticker,
        count,
      }));

      // Sort arrays by count in descending order
      tagCounts.sort((a, b) => b.count - a.count);
      categoryCounts.sort((a, b) => b.count - a.count);
      tickerCounts.sort((a, b) => b.count - a.count);

      // Save sorted arrays back to Firestore
      await Promise.all([
        tagCountsRef.set({ tags: tagCounts }),
        categoryCountsRef.set({ categories: categoryCounts }),
        tickerCountsRef.set({ tickers: tickerCounts }),
      ]);

      console.log(
        "Portfolio tags, category counts, and ticker counts updated successfully.",
      );
    } catch (error) {
      console.error(
        "Error updating portfolio tags, category counts, and ticker counts:",
        error,
      );
    }
  });
