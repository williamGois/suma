import jwt from "jsonwebtoken";
import useMongo, { closeConnection, ObjectId } from "../../../helpers/useMongo";
import productWallet from "../../../models/productWallet";
import user from "../../../models/user";
import validateAuthBearer from "./../../../helpers/ValidateAuth/validateAuthBearer";

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const body = event.body && JSON.parse(event.body);
  let conn;
  try {
    const decryptedToken = validateAuthBearer(event.headers["Authorization"]);

    const { productType_id } = body;
    if (!productType_id) throw new Error("No productType_id");

    conn = await useMongo();
    const ProductWallet = productWallet(conn);
    const User = user(conn);

    const aggregateQuery = [
      {
        $match: { product_id: ObjectId(productType_id) }
      },
      {
        $lookup: {
          from: "users",
          localField: "producer_id",
          foreignField: "_id",
          as: "producer"
        }
      },
      { $unwind: { path: "$producer", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: "$producer._id",
          name: "$producer.name",
          email: "$producer.email",
          mobile: "$producer.mobile",
          "product._id": "$_id",
          "product.isActive": "$isActive",
          "product.product_id": "$product_id",
          "product.producer_id": "$producer_id",
          "product.property_id": "$property_id",
          "product.price": "$price",
          "product.transactions": "$transactions"
        }
      }
    ];

    console.log(aggregateQuery);
    const found = await ProductWallet.aggregate(aggregateQuery);
    console.log(found);

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
