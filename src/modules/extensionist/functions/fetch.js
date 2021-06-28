import useMongo, { closeConnection } from "../../../helpers/useMongo";
import user from "../../../models/user";
import validateAuthBearer from "../../../helpers/ValidateAuth/validateAuthBearer";

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  let conn;

  try {
    validateAuthBearer(event.headers["Authorization"]);
    if (!event.body) new Error("failed to receive the body");

    conn = await useMongo();
    const User = user(conn);

    const query = JSON.parse(event.body);
    const found = await User.findOne(query).lean();
    delete found.password;
    closeConnection(conn);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify(found)
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
