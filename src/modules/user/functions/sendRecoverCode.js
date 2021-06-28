import useMongo, { closeConnection } from "../../../helpers/useMongo";
import user from "../../../models/user";
import getAccessCode from "../../../helpers/access/validations/getAccessCode";
import sendUserRecoverCodeEmail from "./../../../helpers/sender/emails/user/sendRecoverCode";

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const body = event.body && JSON.parse(event.body);

  let conn;
  try {
    // const decryptedToken = validateAuthBearer(event.headers["Authorization"]);

    conn = await useMongo();
    const User = user(conn);

    const userFound = await User.findOne({ email: body.email });
    if (!userFound) {
      throw new Error("Email not Found");
    }

    const userUpdated = await User.findByIdAndUpdate(
      userFound._id,
      { accessCode: getAccessCode() },
      { lean: true, new: true }
    );

    const emailSent = await sendUserRecoverCodeEmail(userUpdated);
    console.log("EMAiL SENT", emailSent);

    await closeConnection(conn);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify({
        userId: userUpdated._id
      })
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
