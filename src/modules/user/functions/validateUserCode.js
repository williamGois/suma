import useMongo, { closeConnection } from "../../../helpers/useMongo";
import user from "../../../models/user";
// import sendUserWelcomeEmail from "../../../helpers/sender/emails/user/welcomeEmail";

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const { code, userId: _id } = JSON.parse(event.body);
  let conn;
  try {
    conn = await useMongo();
    const User = user(conn);

    const userFound = await User.findOne({ _id });
    console.log("userFound", userFound);

    if (userFound.accessCode.code !== code) {
      throw new Error("Code invalid");
    }

    delete userFound.password;
    await closeConnection(conn);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify(userFound)
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
