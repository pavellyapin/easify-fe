/* eslint-disable no-undef */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sharp = require("sharp");
const path = require("path");
const os = require("os");
const fs = require("fs");

const bucketName = "easify-routine-images"; // Replace with your bucket name

exports.resizeAllImagesOnCommand = functions.firestore
  .document("commands/{commandId}")
  .onCreate(async (snap) => {
    const commandData = snap.data();

    console.log("Command data received:", commandData);

    if (commandData.name !== "resizeAllImages") {
      console.log("Command name is not 'resizeAllImages'. Exiting.");
      return null;
    }

    const bucket = admin.storage().bucket(bucketName);

    try {
      console.log(`Fetching file list from bucket: ${bucketName}`);
      const [files] = await bucket.getFiles();
      console.log(`Found ${files.length} files in bucket.`);

      // Filter files that don't have the "processed" metadata set to true
      const unprocessedFiles = [];
      for (const file of files) {
        const metadata = await file.getMetadata();
        if (
          !metadata[0].metadata ||
          metadata[0].metadata.processed !== "true"
        ) {
          unprocessedFiles.push(file);
        }
        if (unprocessedFiles.length >= 10) break; // Limit to 10 files
      }

      console.log(`Found ${unprocessedFiles.length} unprocessed files.`);

      const resizePromises = unprocessedFiles.map(async (file) => {
        const filePath = file.name;
        const fileName = path.basename(filePath);
        const tempFilePath = path.join(os.tmpdir(), fileName);
        const resizedFilePath = path.join(os.tmpdir(), `resized_${fileName}`);

        console.log(`Processing file: ${filePath}`);

        try {
          console.log(`Downloading file: ${filePath}`);
          await file.download({ destination: tempFilePath });
          console.log(`Downloaded file to: ${tempFilePath}`);

          console.log(`Resizing file: ${tempFilePath}`);
          await sharp(tempFilePath).resize(512, 512).toFile(resizedFilePath);
          console.log(`Resized file saved to: ${resizedFilePath}`);

          console.log(`Uploading resized file to: ${filePath}`);
          await bucket.upload(resizedFilePath, {
            destination: filePath,
            metadata: {
              metadata: {
                processed: "true", // Mark file as processed
              },
            },
          });
          console.log(`Uploaded resized file to: ${filePath}`);

          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
            console.log(`Deleted temporary file: ${tempFilePath}`);
          }
          if (fs.existsSync(resizedFilePath)) {
            fs.unlinkSync(resizedFilePath);
            console.log(`Deleted resized temporary file: ${resizedFilePath}`);
          }
        } catch (fileError) {
          console.error(`Error processing file: ${filePath}`, fileError);
        }
      });

      await Promise.all(resizePromises);
      console.log(`Processed ${unprocessedFiles.length} images successfully.`);
    } catch (error) {
      console.error("Error during resizing operation:", error);
    }
  });
