import useMongo, { closeConnection } from "../../../helpers/useMongo";
import demand from "../../../models/demand";
import business from "../../../models/business";
import branch from "../../../models/branch";
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
    const Demand = demand(conn);
    const Business = business(conn);
    const Branch = branch(conn);

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
        $project: {
          _id: 1,
          items: 1,
          business_id: 1,
          branch_id: 1,
          "business._id": 1,
          "branch._id": 1,
          "business.name": 1,
          "branch.name": 1
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
    castToObjectId(Demand, strippedBody);
    aggregateQuery.unshift({
      $match: strippedBody
    });
    console.log(aggregateQuery);

    const paginate = Demand.aggregatePaginate(
      Demand.aggregate(aggregateQuery),
      {
        page: body.page || 1,
        limit: body.limit || 10
      }
    );

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
