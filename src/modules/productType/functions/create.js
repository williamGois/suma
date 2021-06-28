import useMongo, { closeConnection } from "../../../helpers/useMongo";
import productType from "../../../models/productType";
import validateAuthBearer from "../../../helpers/ValidateAuth/validateAuthBearer";

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  let conn;

  try {
    const decryptedToken = validateAuthBearer(event.headers["Authorization"]);
    const user = await JSON.parse(decryptedToken.user)
    const productInfo = JSON.parse(event.body);

    if (!productInfo) {
      throw new Error(
        JSON.stringify({ code: "UP00", message: "Post without body" })
      );
    }

    conn = await useMongo();
    const ProductType = productType(conn);
    const newProduct = new ProductType({ ...productInfo,createdBy:user._id });
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
