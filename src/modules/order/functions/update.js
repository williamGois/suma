import useMongo, { closeConnection } from "../../../helpers/useMongo";
import order from "../../../models/order";
import validateAuthBearer from "./../../../helpers/ValidateAuth/validateAuthBearer";

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const body = JSON.parse(event.body);
  let conn;
  try {
    validateAuthBearer(event.headers["Authorization"]);

    conn = await useMongo();
    const Order = order(conn);

    const { _id } = body;
    delete body._id;
    const updated = await Order.findByIdAndUpdate(
      _id,
      { items: body.items },
      {
        lean: true,
        new: true
      }
    );
    console.log("UPDATED", updated);
    await closeConnection(conn);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify(updated)
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
