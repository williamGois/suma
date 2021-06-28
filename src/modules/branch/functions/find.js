import jwt from "jsonwebtoken";
import useMongo, { closeConnection } from "../../../helpers/useMongo";
import branch from "../../../models/branch";
import business from "../../../models/business";
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
        $project: {
          name: 1,
          cnpj: 1,
          contact_name: 1,
          contact_email: 1,
          business_id: 1,
          address: 1,
          deliveryWindows: 1,
          "business._id": 1,
          "business.name": 1
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
    castToObjectId(Branch, strippedBody);
    aggregateQuery.unshift({
      $match: strippedBody
    });
    console.log(aggregateQuery);

    const paginate = Branch.aggregatePaginate(
      Branch.aggregate(aggregateQuery),
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
