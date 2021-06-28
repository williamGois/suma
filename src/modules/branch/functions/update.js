import jwt from "jsonwebtoken";
import useMongo, { closeConnection } from "../../../helpers/useMongo";
import branch from "../../../models/branch";
import validateAuthBearer from "./../../../helpers/ValidateAuth/validateAuthBearer"

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const body = JSON.parse(event.body);
  let conn;
  try {
    const decryptedToken = validateAuthBearer(event.headers["Authorization"]);


    conn = await useMongo();
    const Branch = branch(conn);

    const { _id } = body;
    delete body._id;
    const updated = await Branch.findByIdAndUpdate( _id , body, {lean:true,new:true});
    console.log("UPDATED", updated)
    await closeConnection(conn);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify(updated)
    };
  } catch (error) {
    if(conn) {
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
