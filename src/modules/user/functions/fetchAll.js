import useMongo, { closeConnection } from "../../../helpers/useMongo";
import user from "../../../models/user";
import validateAuthBearer from "./../../../helpers/ValidateAuth/validateAuthBearer";
import cleanPasswordFromUserList from "../../../helpers/cleanPasswordFromUserlist";

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  let conn;
  try {
    validateAuthBearer(event.headers["Authorization"]);

    conn = await useMongo();
    const User = user(conn);
    const userList = await User.find().lean();
    await closeConnection(conn);

    const cleanedList = cleanPasswordFromUserList(userList);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify(cleanedList)
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
