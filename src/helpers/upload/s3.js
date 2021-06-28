import aws from "aws-sdk";

export default (options, params) => {
  const s3 = new aws.S3(options);

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};
