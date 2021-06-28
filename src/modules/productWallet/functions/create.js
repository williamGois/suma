import useMongo, { closeConnection } from "../../../helpers/useMongo";
import productWallet from "../../../models/productWallet";
import validateAuthBearer from "../../../helpers/ValidateAuth/validateAuthBearer";

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  let conn;

  try {
    validateAuthBearer(event.headers["Authorization"]);
    const productWalletInfo = JSON.parse(event.body);

    if (!productWalletInfo) {
      throw new Error(
        JSON.stringify({ code: "UP00", message: "Post without body" })
      );
    }

    conn = await useMongo();
    const ProductWallet = productWallet(conn);
    const newProduct = new ProductWallet({ ...productWalletInfo });
    const savedProduct = await newProduct.save()
    await closeConnection(conn);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify(savedProduct)
    };
  } catch (error) {
    if (conn) {
      await closeConnection(conn);
    }
    console.log("ERROR: ", error);
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
