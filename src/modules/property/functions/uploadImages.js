import useMongo, { closeConnection } from "../../../helpers/useMongo";
import property from "../../../models/property";
import validateAuthBearer from "./../../../helpers/ValidateAuth/validateAuthBearer";

import parser from "../../../helpers/upload/fileParser";
import awsUploader from "../../../helpers/upload/awsUploader";

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const property_id = event.pathParameters.property_id;

  try {
    const decryptedToken = validateAuthBearer(event.headers["Authorization"]);

    const parsedBody = await parser(event);
    const awsFileLocation = await awsUploader(parsedBody, {
      id: property_id,
      folder: "property"
    });

    const imageForDB = {
      id: awsFileLocation.Key,
      imageName: parsedBody.filename,
      s3uri: awsFileLocation.Location,
      s3key: awsFileLocation.Key
    };

    const conn = await useMongo();
    const Property = property(conn);
    await Property.updateOne(
      { _id: property_id },
      { $push: { images: imageForDB } }
    );
    const found = await Property.findOne({ _id: property_id }).lean();
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
