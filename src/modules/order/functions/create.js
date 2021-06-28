import useMongo, { closeConnection } from "../../../helpers/useMongo";
import order from "../../../models/order";
import productWallet from "../../../models/productWallet";
import validateAuthBearer from "./../../../helpers/ValidateAuth/validateAuthBearer";
import removeFromStock from "../../../helpers/removeFromStock";

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const body = event.body && JSON.parse(event.body);
  let conn;
  try {
    validateAuthBearer(event.headers["Authorization"]);

    conn = await useMongo();
    const Order = order(conn);
    const ProductWallet = productWallet(conn);
    const newOrder = new Order(body);
    const saved = await newOrder.save();
    console.log("SAVED", saved);

    await removeFromStock(saved, ProductWallet);

    await closeConnection(conn);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify(saved)
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
