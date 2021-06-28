import useMongo, { closeConnection, ObjectId } from "../../../helpers/useMongo";
import user from "../../../models/user";
import validateAuthBearer from "./../../../helpers/ValidateAuth/validateAuthBearer";

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let conn;
  try {
    const decryptedToken = validateAuthBearer(event.headers["Authorization"]);
    const loggedUser = JSON.parse(decryptedToken.user);

    conn = await useMongo();
    const User = user(conn);

    let query = { roles: "producer" };
    if (!loggedUser.roles.find(role => role === "user" || role === "admin")) {
      query = {
        ...query,
        "producer.extensionist_id": ObjectId(loggedUser._id)
      };
    }
    const found = await User.find(query);

    await closeConnection(conn);
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
