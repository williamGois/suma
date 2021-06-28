const aws = require("aws-sdk");
const crypto = require("crypto");

/**
 * This is a simple file uploader for amazon s3 bucket
 * It receives a object with file data and returns a amazon locations
 * @param parsedBody - the object created by the parser function
 * @param config - configuration object
 * @param config.id - the owner of the file ID (property, producer, user...)
 * @param config.folder - the folder in the aws to send it (property, producer, user..)
 *
 * @returns {object} object with Location uri and Key for the item.
 */
module.exports = async ({ file }, { id, folder }) => {
  if (!file) return new Error("no image file");
  if (!id) return new Error("no ID");
  if (!folder) return new Error("no folder selected");

  const s3 = new aws.S3({
    accessKeyId: process.env.IAM_ACCESS_KEY,
    secretAccessKey: process.env.IAM_SECRET_KEY
  });

  const key = await crypto.randomBytes(4).toString("hex"); //just in case
  const timestamp = new Date().getTime(); //time stamp

  const params = {
    Bucket: process.env.BUCKET_NAME,
    ACL: "public-read",
    Key: `${folder}/${id}/${timestamp}-${key}-${file.filename}`,
    Body: file.data,
    contentType: file.contentType
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};
