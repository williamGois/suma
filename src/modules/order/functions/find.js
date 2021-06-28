import useMongo, { closeConnection } from "../../../helpers/useMongo";
import order from "../../../models/order";
import business from "../../../models/business";
import branch from "../../../models/branch";
import ubf from "../../../models/ubf";
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
    const Order = order(conn);
    const Business = business(conn);
    const Branch = branch(conn);
    const Ubf = ubf(conn);

    const aggregateQuery = [
      {
        $lookup: {
          from: "businesses",
          localField: "business_id",
          foreignField: "_id",
          as: "business"
        }
      },
      { $unwind: { path: "$business", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "branches",
          localField: "branch_id",
          foreignField: "_id",
          as: "branch"
        }
      },
      { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "ubfs",
          localField: "ubf_id",
          foreignField: "_id",
          as: "ubf"
        }
      },
      { $unwind: { path: "$ubf", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          order_num: 1,
          items: 1,
          business_id: 1,
          branch_id: 1,
          ubf_id: 1,
          "business._id": 1,
          "branch._id": 1,
          "ubf._id": 1,
          "business.name": 1,
          "branch.name": 1,
          "ubf.name": 1
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
    castToObjectId(Order, strippedBody);
    aggregateQuery.unshift({
      $match: strippedBody
    });
    console.log(aggregateQuery);

    const paginate = Order.aggregatePaginate(Order.aggregate(aggregateQuery), {
      page: body.page || 1,
      limit: body.limit || 10
    });

    const found = await paginate;

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
