import jwt from "jsonwebtoken";
import useMongo, { closeConnection } from "../../../helpers/useMongo";
import buyOrderFulfill from "../../../models/buyOrderFulfill";
import validateAuthBearer from "./../../../helpers/ValidateAuth/validateAuthBearer";
import castToObjectId from "./../../../helpers/castToObjectId";
import getNonSearchQuery from "./../../../helpers/getNonSearchQuery";

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const body = event.body && JSON.parse(event.body);
  let conn;
  try {
    const decryptedToken = validateAuthBearer(event.headers["Authorization"]);

    conn = await useMongo();
    const BuyOrderFulfill = buyOrderFulfill(conn);

    const aggregateQuery = [
      {
        $lookup: {
          from: "buy-orders",
          localField: "buyOrder_id",
          foreignField: "_id",
          as: "buyOrder"
        }
      },
      { $unwind: { path: "$buyOrder", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "businesses",
          localField: "buyOrder.business_id",
          foreignField: "_id",
          as: "buyOrder.business"
        }
      },
      {
        $unwind: {
          path: "$buyOrder.business",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "branches",
          localField: "buyOrder.branch_id",
          foreignField: "_id",
          as: "buyOrder.branch"
        }
      },
      {
        $unwind: { path: "$buyOrder.branch", preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 1,
          buyOrder_id: 1,
          items: 1,
          // "buyOrder.items": 1,
          "buyOrder.business._id": 1,
          "buyOrder.branch._id": 1,
          "buyOrder.business.name": 1,
          "buyOrder.branch.name": 1
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
    castToObjectId(BuyOrderFulfill, strippedBody);
    aggregateQuery.unshift({
      $match: strippedBody
    });
    console.log(aggregateQuery);

    const paginate = BuyOrderFulfill.aggregatePaginate(
      BuyOrderFulfill.aggregate(aggregateQuery),
      {
        page: body.page || 1,
        limit: body.limit || 10
      }
    );

    const found = await paginate;

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
