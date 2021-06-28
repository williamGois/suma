import jwt from "jsonwebtoken";
import useMongo, { closeConnection } from "../../../helpers/useMongo";
import user from "../../../models/user";
import generateHash from "../../../helpers/access/validations/generateHash";
import validateHash from "../../../helpers/access/validations/validateHash";
import validateAuthBearer from "./../../../helpers/ValidateAuth/validateAuthBearer";

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let conn;

  const body = event.body && JSON.parse(event.body);
  try {
    // const decryptedToken = validateAuthBearer(event.headers["Authorization"]);
    const { userId, accessCode, password, passwordConfirm } = body;

    conn = await useMongo();
    const User = user(conn);

    const userFound = await User.findById(userId);
    console.log(body);
    console.log(userFound);

    if (userFound.accessCode.code !== accessCode) {
      throw new Error("Wrong access code");
    }

    if (password !== passwordConfirm) {
      throw new Error(
        JSON.stringify({
          code: "UP02",
          message: "Passwords don't match"
        })
      );
    }

    const hashedPassword = await generateHash(password);

    if (
      userFound.password &&
      validateHash(userFound.password, hashedPassword)
    ) {
      throw new Error(
        JSON.stringify({
          code: "UP01",
          message: "password must be different from last one"
        })
      );
    }

    await userFound.update({
      password: hashedPassword
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
