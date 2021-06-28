import moment from "moment";
import jwt from "jsonwebtoken";
import emailValidator from "../../../helpers/regex/validators/email";
import useMongo, { closeConnection } from "../../../helpers/useMongo";
import user from "../../../models/user";
import getAccessCode from "../../../helpers/access/validations/getAccessCode";
import validateAuthBearer from "./../../../helpers/ValidateAuth/validateAuthBearer"

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const body = event.body && JSON.parse(event.body);
  let conn;
  try {
    const decryptedToken = validateAuthBearer(event.headers["Authorization"]);


    conn = await useMongo();
    const User = user(conn);
    console.log("body", body);
    const query =
      !body.search || body.search === ""
        ? {}
        : body.fields.reduce(
            (payload, field) => {
              console.log(payload);
              payload.$or.push({
                [field]: { $regex: new RegExp(body.search), $options: "i" }
              });
              return payload;
            },
            { $or: [] }
          );

    console.log(query);
    const found = await User.paginate(query, {
      page: body.page || 1,
      limit: body.limit || 10
    });

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
