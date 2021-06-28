import jwt from "jsonwebtoken";
import useMongo, { closeConnection } from "../../../helpers/useMongo";
import quiz from "../../../models/quiz";
import validateAuthBearer from "./../../../helpers/ValidateAuth/validateAuthBearer";
import questions from "./../questions";

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const body = event.body && JSON.parse(event.body);
  let conn;
  try {
    const decryptedToken = validateAuthBearer(event.headers["Authorization"]);

    conn = await useMongo();
    const Quiz = quiz(conn);

    console.log("QUERY", body);
    let found = await Quiz.findOneAndUpdate(
      { property_id: body.property_id },
      {},
      {
        new: true,
        upsert: true,
        lean: true,
        omitUndefined: true
      }
    );
    console.log("FOUND", found);

    if (!found.questions) {
      found = await Quiz.findOneAndUpdate(
        { property_id: body.property_id },
        { questions },
        {
          new: true,
          upsert: true,
          lean: true,
          omitUndefined: true
        }
      );
      console.log("new found", found);
    }

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
