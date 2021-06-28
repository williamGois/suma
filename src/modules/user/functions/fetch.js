import jwt from "jsonwebtoken";
import useMongo, { closeConnection } from "../../../helpers/useMongo";
import user from "../../../models/user";
import validateAuthBearer from "./../../../helpers/ValidateAuth/validateAuthBearer"

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const query = event.body && JSON.parse(event.body);
  let conn;
  try {
    const decryptedToken = validateAuthBearer(event.headers["Authorization"]);

    conn = await useMongo();
    const User = user(conn);

    console.log("query", query);
    const found = await User.findOne(query).lean();

    await closeConnection(conn);
    delete found.password;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify(found)
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
