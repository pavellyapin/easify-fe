/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { hasPartialMatchV2 } = require("../utils");

const firestore = admin.firestore();

exports.analyzeResumeAndMatchIndustries = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      console.log("Unauthorized attempt to call the function.");
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated.",
      );
    }

    const userId = context.auth.uid;
    console.log(`Starting industry analysis for user: ${userId}`);

    try {
      // 1. Find the user's main resume
      const resumeRef = firestore
        .collection(`users/${userId}/resumes`)
        .where("isMain", "==", true)
        .limit(1);

      const resumeSnapshot = await resumeRef.get();

      if (resumeSnapshot.empty) {
        console.log(`No main resume found for user: ${userId}`);
        throw new functions.https.HttpsError(
          "not-found",
          "No main resume found.",
        );
      }

      const resumeDoc = resumeSnapshot.docs[0];
      console.log(`Main resume found with ID: ${resumeDoc.id}`);

      // 2. Find the 'scan' document inside the 'reports' collection within the main resume
      const scanRef = firestore
        .collection(`users/${userId}/resumes/${resumeDoc.id}/reports`)
        .doc("scan");

      const scanDoc = await scanRef.get();

      if (!scanDoc.exists) {
        console.log(`No scan found for resume ID: ${resumeDoc.id}`);
        throw new functions.https.HttpsError(
          "not-found",
          "No scan found for this resume.",
        );
      }

      const scanData = scanDoc.data();
      console.log(`Scan found for resume ID: ${resumeDoc.id}`);

      const { relatedIndustries } = scanData["analysis"] || {};

      if (!relatedIndustries || relatedIndustries.length === 0) {
        console.log(
          `No related industries found in the scan for resume ID: ${resumeDoc.id}`,
        );
        throw new functions.https.HttpsError(
          "not-found",
          "No related industries found in the scan.",
        );
      }

      // Check if relatedIndustries is an array and convert it to a comma-separated string if true
      let relatedIndustriesStr = "";
      if (Array.isArray(relatedIndustries)) {
        relatedIndustriesStr = relatedIndustries.join(", ");
      } else {
        relatedIndustriesStr = relatedIndustries;
      }

      console.log(
        `Related industries for resume ID ${resumeDoc.id}: ${relatedIndustriesStr}`,
      );

      // 3. Query all industries to match the relatedIndustries and their tags
      const industriesRef = firestore.collection("industries");
      const industriesSnapshot = await industriesRef.get();

      const industryMatchCountMap = new Map(); // To track match count per industry

      industriesSnapshot.forEach((industryDoc) => {
        const industryData = industryDoc.data();
        const industryTags = industryData.tags || [];

        industryTags.forEach((tag) => {
          if (hasPartialMatchV2(tag, relatedIndustriesStr)) {
            console.log(
              `Match found for tag: ${tag} in industry: ${industryData.name}`,
            );

            // Check if the industry is already in the map
            if (!industryMatchCountMap.has(industryDoc.id)) {
              // Initialize the count for the industry
              industryMatchCountMap.set(industryDoc.id, {
                count: 1,
                id: industryDoc.id,
                name: industryData.name,
                tags: industryTags,
              });
            } else {
              // Increment the count if the industry already has a match
              const industryInfo = industryMatchCountMap.get(industryDoc.id);
              industryInfo.count += 1;
              industryMatchCountMap.set(industryDoc.id, industryInfo);
            }
          }
        });
      });

      // Convert the map to an array and sort by the match count in descending order
      const sortedIndustries = Array.from(industryMatchCountMap.values()).sort(
        (a, b) => b.count - a.count,
      );

      // Return only the top 5 industries
      const matchedIndustries = sortedIndustries.slice(0, 5);

      console.log("Top 5 matched industries: ", matchedIndustries);

      return { matchedIndustries };
    } catch (error) {
      console.error("Error analyzing resume and matching industries:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Unable to analyze resume or match industries",
      );
    }
  },
);
