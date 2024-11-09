/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getRandomSelection, hasPartialMatch } = require("../utils");

const firestore = admin.firestore();

exports.recommendFinancialPlans = functions.https.onCall(
  async (data, context) => {
    const { financialTags, count } = data;

    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated.",
      );
    }

    try {
      const userRef = firestore.collection("users").doc(context.auth.uid);
      const plansRef = firestore.collection("financialPlans");

      let tagsToUse = financialTags;

      // If no financialTags were provided
      if (!financialTags || financialTags.length === 0) {
        console.log("No financialTags provided. Fetching started plans.");

        // Fetch the user's started financial plans under users/{userId}/financialPlans
        const startedPlansSnapshot = await firestore
          .collection(`users/${context.auth.uid}/financialPlans`)
          .get();

        const startedPlans = startedPlansSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            tags: data.tags || [],
          };
        });

        // Extract tags from started plans if they exist
        const startedPlanTags = startedPlans.reduce((acc, plan) => {
          return acc.concat(plan.tags);
        }, []);

        if (startedPlanTags.length > 0) {
          console.log("Using tags from started plans:", startedPlanTags);
          tagsToUse = startedPlanTags;
        } else {
          // If no started plans or tags, fetch user financial planning categories and tags
          console.log("No tags from started plans, fetching user preferences.");

          const userDoc = await userRef.get();
          const userData = userDoc.data();

          const userFinancialPlanning = userData.financialPlanning || {};
          tagsToUse = [
            ...(userFinancialPlanning.planCategories || []),
            ...(userFinancialPlanning.planTags || []),
          ];

          console.log(
            "Using tags from user's financial planning preferences:",
            tagsToUse,
          );
        }
      }

      if (tagsToUse.length === 0) {
        console.log("No tags available, returning all financial plans.");

        // Fetch all financial plans
        const allPlansSnapshot = await plansRef.get();
        const allPlans = allPlansSnapshot.docs.map((doc) => {
          const data = doc.data().financialPlan;
          return {
            id: doc.id,
            createdDate: doc.data().createdDate,
            name: data.name,
            description: data.description,
            category: data.category,
            tags: data.tags,
          };
        });

        // If count is specified, return a random selection of the plans
        if (count) {
          return getRandomSelection(allPlans, count);
        }

        return allPlans;
      }

      console.log("Tags to use for fetching financial plans:", tagsToUse);

      // Fetch financial plans that match any of the financialTags
      const plansQuerySnapshot = await plansRef
        .where("financialPlan.tags", "array-contains-any", tagsToUse)
        .get();

      const financialPlans = plansQuerySnapshot.docs.map((doc) => {
        const data = doc.data().financialPlan;
        return {
          id: doc.id,
          createdDate: doc.data().createdDate,
          name: data.name,
          description: data.description,
          category: data.category,
          tags: data.tags,
        };
      });

      console.log(
        "Found financial plans matching tags:",
        financialPlans.length,
      );

      // Fetch all financial plans for broader filtering
      const allPlansSnapshot = await plansRef.get();
      const allPlans = allPlansSnapshot.docs.map((doc) => {
        const data = doc.data().financialPlan;
        return {
          id: doc.id,
          createdDate: doc.data().createdDate,
          name: data.name,
          description: data.description,
          category: data.category,
          tags: data.tags,
        };
      });

      // Filter additional financial plans based on partial tag matches
      const additionalPlans = allPlans.filter((plan) => {
        // Check if the plan has tags before filtering
        if (!plan.tags || plan.tags.length === 0) {
          console.log(`Plan ${plan.name} does not have any tags, skipping.`);
          return false; // Skip this plan if it has no tags
        }

        return tagsToUse.some((tag) =>
          plan.tags.some(
            (planTag) =>
              !financialPlans.find((p) => p.id === plan.id) &&
              hasPartialMatch(tag, planTag),
          ),
        );
      });

      console.log(
        "Found additional financial plans based on partial matches:",
        additionalPlans.length,
      );

      // Combine and deduplicate the financial plan recommendations
      const uniquePlans = new Map();
      [...financialPlans, ...additionalPlans].forEach((plan) => {
        uniquePlans.set(plan.id, plan);
      });

      let recommendedPlans = Array.from(uniquePlans.values());

      // If count is specified, return a random selection of the plans
      if (count) {
        recommendedPlans = getRandomSelection(recommendedPlans, count);
      }

      console.log(
        "Final recommended financial plans:",
        recommendedPlans.length,
      );

      return recommendedPlans;
    } catch (error) {
      console.error("Error recommending financial plans:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Unable to recommend financial plans",
      );
    }
  },
);
