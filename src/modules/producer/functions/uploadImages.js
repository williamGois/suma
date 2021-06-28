import jwt from "jsonwebtoken";
import useMongo, { closeConnection } from "../../../helpers/useMongo";
import user from "../../../models/user";
import validateAuthBearer from "./../../../helpers/ValidateAuth/validateAuthBearer"

import parser from "../../../helpers/upload/fileParser";
import awsUploader from "../../../helpers/upload/awsUploader";


export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const producer_id = event.pathParameters.producer_id;

  try {
    const decryptedToken = validateAuthBearer(event.headers["Authorization"]);


    const parsedBody = await parser(event);
    const awsFileLocation = await awsUploader(parsedBody, {
      id: producer_id,
      folder: "producer"
    });

    const imageForDB = {
      id: awsFileLocation.Key,
      imageName: parsedBody.filename,
      s3uri: awsFileLocation.Location,
      s3key: awsFileLocation.Key
    };

    const conn = await useMongo();
    const producer = user(conn);
    await producer.updateOne(
      { _id: producer_id },
      { $push: { images: imageForDB } }
    );
    const found = await producer.findOne({ _id: producer_id }).lean();
    delete found.password;
    await closeConnection(conn);

    return {
      statusCode: 200,
      body: JSON.stringify({ found })
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify(error.message)
    };
  }
};
