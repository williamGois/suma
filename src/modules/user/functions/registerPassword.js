import useMongo, { closeConnection } from "../../../helpers/useMongo";
import user from "../../../models/user";
// import sendUserWelcomeEmail from "../../../helpers/sender/emails/user/welcomeEmail";
import generateHash from "../../../helpers/access/validations/generateHash";

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const { code, userId: _id, password, passwordConfirm } = JSON.parse(
    event.body
  );
    let conn;
  try {
    if (password !== passwordConfirm) {
      throw new Error("password not match");
    }

    conn = await useMongo();
    const User = user(conn);

    console.log(code, _id, password, passwordConfirm)
    const userFound = await User.findOne({ _id, "accessCode.code": code });
    // if (!user.isActive) {
    //   console.log(userFound);
    //   sendUserWelcomeEmail(userFound);
    // }
    await userFound.update({
      isActive: true,
      password: await generateHash(password),
      $unset: { accessCode: true }
    });
    await closeConnection(conn);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify({ email: userFound.email })
    };
  } catch (error) {
    if(conn) {
      await closeConnection(conn);
    }
    console.log(error);
    return { statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      }, body: JSON.stringify(error.message) };
  }
};
