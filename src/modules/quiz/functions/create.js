import useMongo, { closeConnection } from "../../../helpers/useMongo";
import quiz from "../../../models/quiz";
import validateAuthBearer from "../../../helpers/ValidateAuth/validateAuthBearer";

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let conn;

  try {
    validateAuthBearer(event.headers["Authorization"]);
    const body = JSON.parse(event.body);

    conn = await useMongo();
    const Quiz = quiz(conn);
    const newQuiz = new Quiz();
    const savedQuiz = await newQuiz.save();
    await closeConnection(conn);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify({ body: savedQuiz })
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
