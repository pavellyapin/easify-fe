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

    // Temporary local file path to download the file to
    const tempFilePath = path.join(os.tmpdir(), fileName);
    await bucket.file(filePath).download({ destination: tempFilePath });

    // Resize the image (overwrite the original file name)
    const resizedImagePath = path.join(os.tmpdir(), fileName); // No "resized_" prefix
    await sharp(tempFilePath).resize(512, 512).toFile(resizedImagePath);

    // Upload the resized image back to Firebase Storage, overwriting the original image
    await bucket.upload(resizedImagePath, {
      destination: filePath, // Overwrite the original file
    });

    // Delete the temporary files
    fs.unlinkSync(tempFilePath);
    fs.unlinkSync(resizedImagePath);

    console.log("Resized image uploaded to", filePath);
  });
