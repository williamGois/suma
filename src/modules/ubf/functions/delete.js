import useMongo, { closeConnection } from "../../../helpers/useMongo";
import ubf from "../../../models/ubf";
import validateAuthBearer from "./../../../helpers/ValidateAuth/validateAuthBearer";

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let conn;
  try {
    validateAuthBearer(event.headers["Authorization"]);

    conn = await useMongo();
    const Ubf = ubf(conn);

    const ubfId = event.pathParameters.ubfId;

    const updated = await Ubf.findByIdAndUpdate(ubfId, { isActive: false });
    console.log("UPDATED", updated);
    await closeConnection(conn);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      }
    };
  } catch (error) {
    if (conn) {
      await closeConnection(conn);
    }
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
