import jwt from "jsonwebtoken";
import useMongo, { closeConnection } from "../../../helpers/useMongo";
import quiz from "../../../models/quiz";
import validateAuthBearer from "../../../helpers/ValidateAuth/validateAuthBearer";

export const v2 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let conn;

  try {
    validateAuthBearer(event.headers["Authorization"]);
    const body = JSON.parse(event.body);
    if (!body) throw Error("invalid body request");

    conn = await useMongo();
    const Quiz = quiz(conn);
    await Quiz.findOneAndUpdate(
      { _id: body._id },
      { $set: { ...body } },
      { upsert: true }
    );
    await closeConnection(conn);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify({ test: true })
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

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const body = event.body && JSON.parse(event.body);
  let conn;
  try {
    const decryptedToken = validateAuthBearer(event.headers["Authorization"]);

    try {
      conn = await useMongo();
      const Quiz = quiz(conn);
      const found = await Quiz.findOne({
        property_id: body.property_id
      }).lean();
      if (found) {
        console.log("FOUND", found);

        const updated = await Quiz.updateOne(
          { property_id: body.property_id },
          {
            ...found,
            questions: {
              ...found.questions,
              ...body.questions
            }
          }
        );

        if (updated.ok > 0) {
          const quizUpdated = await Quiz.findOne({
            property_id: body.property_id
          }).lean();

          await closeConnection(conn);
          return {
            statusCode: 200,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify(quizUpdated)
          };
        } else {
          await closeConnection(conn);
          return {
            statusCode: 500,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Credentials": true
            }
          };
        }
      } else {
        const saved = await new Quiz(body).save();
        await closeConnection(conn);
        return {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true
          },
          body: JSON.stringify(saved)
        };
      }
    } catch (error) {
      if (conn) {
        await closeConnection(conn);
      }
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify({
          ok: false,
          message: error.message
        })
      };
    }
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
