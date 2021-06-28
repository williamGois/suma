import useMongo, { closeConnection } from "../../../helpers/useMongo";
import user from "../../../models/user";
// import sendUserWelcomeEmail from "../../../helpers/sender/emails/user/welcomeEmail";
// import generateHash from "../../../helpers/access/validations/generateHash";
import validateHash from "../../../helpers/access/validations/validateHash";
import generateToken from "../../../helpers/access/token/generate";
// import crypto from "crypto";
// import jwt from "jsonwebtoken";
// import moment from "moment";

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const { login: email, password } = JSON.parse(event.body);
  let conn;
  try {
    conn = await useMongo();
    const User = user(conn);

    const userFound = await User.findOne({ email });
    if (!userFound || !validateHash(userFound.password, password)) {
      throw new Error("Wrong Credentials");
    }
    delete userFound.password;

    const { token, claim } = generateToken(userFound);

    await closeConnection(conn);
    return {
      statusCode: 200,
      body: JSON.stringify(token),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Set-Cookie": `claim=${encodeURIComponent(
          JSON.stringify({
            ...claim,
            ip: event.requestContext.identity.sourceIp,
            agent: event.requestContext.identity.userAgent
          })
        )}`
      }
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
