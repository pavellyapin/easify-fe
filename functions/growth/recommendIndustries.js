/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getRandomSelection, hasPartialMatch } = require("../utils");

const firestore = admin.firestore();

exports.recommendIndustries = functions.https.onCall(async (data, context) => {
  const { industryTags, count } = data;

  if (!context.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated.",
    );
  }

  try {
    const industriesRef = firestore.collection("industries");
    const userRef = firestore.collection("users").doc(context.auth.uid);

    let tagsToUse = industryTags;

    // If no industryTags are provided, fetch user's started industries and/or preferences
    if (!industryTags || industryTags.length === 0) {
      console.log("No industryTags provided. Fetching started industries.");

      // Fetch the user's started industries under users/{userId}/industries
      const startedIndustriesSnapshot = await firestore
        .collection(`users/${context.auth.uid}/industries`)
        .get();

      const startedIndustries = startedIndustriesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          tags: data.tags || [],
        };
      });

      // Extract tags from started industries if they exist
      const startedIndustryTags = startedIndustries.reduce((acc, industry) => {
        return acc.concat(industry.tags);
      }, []);

      if (startedIndustryTags.length > 0) {
        console.log("Using tags from started industries:", startedIndustryTags);
        tagsToUse = startedIndustryTags;
      } else {
        // If no started industries or tags, fetch user industry preferences
        console.log(
          "No tags from started industries, fetching user preferences.",
        );

        const userDoc = await userRef.get();
        const userData = userDoc.data();

        const userWorkSkills = userData.workSkills || {};
        tagsToUse = userWorkSkills.industries || [];

        console.log("Using tags from user's industry preferences:", tagsToUse);
      }
    }

    if (tagsToUse.length === 0) {
      console.log("No tags available, returning all industries.");

      // Fetch all industries
      const allIndustriesSnapshot = await industriesRef.get();
      const allIndustries = allIndustriesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          overview: data.overview,
          tags: data.tags,
        };
      });

      // If count is specified, return a random selection of industries
      if (count) {
        return getRandomSelection(allIndustries, count);
      }

      return allIndustries;
    }

    console.log("Tags to use for fetching industries:", tagsToUse);

    // Fetch industries that match any of the tagsToUse
    const industriesQuerySnapshot = await industriesRef
      .where("tags", "array-contains-any", tagsToUse)
      .get();

    const industries = industriesQuerySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        overview: data.overview,
        tags: data.tags,
      };
    });

    console.log("Found industries matching tags:", industries.length);

    // Fetch all industries for broader filtering
    const allIndustriesSnapshot = await industriesRef.get();
    const allIndustries = allIndustriesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        overview: data.overview,
        tags: data.tags,
      };
    });

    // Filter additional industries based on partial tag matches
    const additionalIndustries = allIndustries.filter((industry) => {
      const industryTagsArray = Array.isArray(industry.tags)
        ? industry.tags
        : [industry.tags]; // Ensure tags is an array

      return tagsToUse.some((tag) =>
        industryTagsArray.some((industryTag) => {
          // Check if the industry is not already in the list and has a partial tag match
          return (
            !industries.find((i) => i.id === industry.id) &&
            hasPartialMatch(tag, industryTag)
          );
        }),
      );
    });

    console.log(
      "Found additional industries based on partial matches:",
      additionalIndustries.length,
    );

    // Combine and deduplicate the industry recommendations
    const uniqueIndustries = new Map();
    [...industries, ...additionalIndustries].forEach((industry) => {
      uniqueIndustries.set(industry.id, industry);
    });

    let recommendedIndustries = Array.from(uniqueIndustries.values());

    // If count is specified, return a random selection of industries
    if (count) {
      recommendedIndustries = getRandomSelection(recommendedIndustries, count);
    }

    console.log("Final recommended industries:", recommendedIndustries.length);

    return recommendedIndustries;
  } catch (error) {
    console.error("Error recommending industries:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Unable to recommend industries.",
    );
  }
});
