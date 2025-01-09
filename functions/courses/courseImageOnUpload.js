const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sharp = require("sharp");
const path = require("path");
const os = require("os");
const fs = require("fs");

// Specify the bucket to listen to
const specificBucketName = "easify-courses-images";

// Cloud Function triggered when a file is finalized (uploaded) in the specific bucket
exports.resizeCourseImage = functions.storage
  .bucket(specificBucketName)
  .object()
  .onFinalize(async (object) => {
    const filePath = object.name; // The full path of the uploaded file
    const bucket = admin.storage().bucket(object.bucket); // Access the specific bucket
    const fileName = path.basename(filePath); // Get the file name

    // Check if the uploaded object is an image
    if (!object.contentType.startsWith("image/")) {
      console.log("This is not an image.");
      return;
    }

    // Check if the file has already been processed
    if (object.metadata && object.metadata.processed === "true") {
      console.log("File has already been processed. Exiting.");
      return;
    }

    // Temporary local file paths
    const tempOriginalPath = path.join(os.tmpdir(), fileName); // Original file
    const tempResizedPath = path.join(os.tmpdir(), `resized_${fileName}`); // Resized file

    try {
      console.log(`Processing file: ${filePath}`);

      // Download the original image to the temp directory
      console.log("Downloading file to", tempOriginalPath);
      await bucket.file(filePath).download({ destination: tempOriginalPath });

      // Resize the image
      console.log("Resizing image to 512x512");
      await sharp(tempOriginalPath).resize(512, 512).toFile(tempResizedPath);

      // Replace the original file with the resized image
      console.log("Uploading resized image to replace original");
      await bucket.upload(tempResizedPath, {
        destination: filePath,
        metadata: {
          metadata: {
            processed: "true", // Add metadata to mark the file as processed
          },
        },
      });

      console.log(`Resized image uploaded successfully to ${filePath}`);
    } catch (error) {
      console.error("Error processing the image:", error);
    } finally {
      // Clean up temporary files
      if (fs.existsSync(tempOriginalPath)) {
        console.log("Deleting temp original file");
        fs.unlinkSync(tempOriginalPath);
      }
      if (fs.existsSync(tempResizedPath)) {
        console.log("Deleting temp resized file");
        fs.unlinkSync(tempResizedPath);
      }
    }
  });
