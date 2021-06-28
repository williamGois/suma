import jwt from "jsonwebtoken";
import useMongo, { closeConnection } from "../../../helpers/useMongo";
import user from "../../../models/user";
import generateHash from "../../../helpers/access/validations/generateHash";
import validateHash from "../../../helpers/access/validations/validateHash";
import validateAuthBearer from "./../../../helpers/ValidateAuth/validateAuthBearer";

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const {
    userId: _id,
    currentPassword,
    password,
    passwordConfirm
  } = JSON.parse(event.body);
  let conn;
  try {
    const decryptedToken = validateAuthBearer(event.headers["Authorization"]);


    if (currentPassword === password) {
      throw new Error(
        JSON.stringify({
          code: "UP01",
          message: "password must be different from last one"
        })
      );
    }
    if (password !== passwordConfirm) {
      throw new Error(
        JSON.stringify({
          code: "UP02",
          message: "password not match"
        })
      );
    }

    conn = await useMongo();
    const User = user(conn);

    const userFound = await User.findOne({ _id });
    console.log(userFound);
    if (!userFound || !validateHash(userFound.password, currentPassword)) {
      throw new Error(
        JSON.stringify({
          code: "UP02",
          message: "Wrong Credentials"
        })
      );
    }

    await userFound.update({
      password: await generateHash(password)
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
