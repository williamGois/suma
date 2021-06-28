import jwt from "jsonwebtoken";
import useMongo, { closeConnection } from "../../../helpers/useMongo";
import productWallet from "../../../models/productWallet";
import productType from "../../../models/productType";
import property from "../../../models/property";
import validateAuthBearer from "./../../../helpers/ValidateAuth/validateAuthBearer";
import castToObjectId from "./../../../helpers/castToObjectId";
import getNonSearchQuery from "./../../../helpers/getNonSearchQuery";

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const body = event.body && JSON.parse(event.body);
  let conn;

  try {
    validateAuthBearer(event.headers["Authorization"]);

    conn = await useMongo();
    const ProductWallet = productWallet(conn);
    const ProductType = productType(conn);
    const Property = property(conn);

    const aggregateQuery = [
      {
        $lookup: {
          from: "product-types",
          localField: "product_id",
          foreignField: "_id",
          as: "product_type"
        }
      },
      { $unwind: { path: "$product_type", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "properties",
          localField: "property_id",
          foreignField: "_id",
          as: "property"
        }
      },
      { $unwind: { path: "$property", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          isActive: 1,
          product_id: 1,
          property_id: 1,
          price: 1,
          transactions: 1,
          "property._id": 1,
          "property.name": 1,
          "property.ownerName": 1,
          "product_type._id": 1,
          "product_type.name": 1,
          quantity_total: { $sum: "$transactions.quantity" }
        }
      }
    ];
    !body.search || body.search === ""
      ? null
      : aggregateQuery.push({
          $match: body.fields.reduce(
            (payload, field) => {
              payload.$or.push({
                [field]: { $regex: new RegExp(body.search), $options: "i" }
              });
              return payload;
            },
            { $or: [] }
          )
        });

    const strippedBody = getNonSearchQuery(body);
    castToObjectId(ProductWallet, strippedBody);
    aggregateQuery.unshift({
      $match: strippedBody
    });
    console.log("query", aggregateQuery);
    const paginate = ProductWallet.aggregatePaginate(
      ProductWallet.aggregate(aggregateQuery),
      {
        page: body.page || 1,
        limit: body.limit || 10
      }
    );

    const found = await paginate;
    console.log(JSON.stringify(found.docs));
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
