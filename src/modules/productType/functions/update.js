import jwt from "jsonwebtoken";
import useMongo, { closeConnection } from "../../../helpers/useMongo";
import productType from "../../../models/productType";
import validateAuthBearer from "../../../helpers/ValidateAuth/validateAuthBearer";
import validadteBody from "../../../helpers/validateBody/validateBody";

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const body = JSON.parse(event.body);

  let conn;

  try {
    validadteBody({ body });
    const decryptedToken = validateAuthBearer(event.headers["Authorization"]);
    const user = await JSON.parse(decryptedToken.user);

    const { _id } = body;
    delete body._id;

    conn = await useMongo();
    const ProductType = productType(conn);
    const updated = await ProductType.findByIdAndUpdate(
      _id,
      { ...body, updatedBy: user._id },
      { lean: true, new: true }
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
    console.log("error", error);
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
