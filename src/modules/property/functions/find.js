import useMongo, { closeConnection, ObjectId } from "../../../helpers/useMongo";
import property from "../../../models/property";
import validateAuthBearer from "./../../../helpers/ValidateAuth/validateAuthBearer";
import castToObjectId from "./../../../helpers/castToObjectId";
import getNonSearchQuery from "./../../../helpers/getNonSearchQuery";

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  let body = event.body && JSON.parse(event.body);
  let conn;
  try {
    const decryptedToken = validateAuthBearer(event.headers["Authorization"]);
    const loggedUser = JSON.parse(decryptedToken.user);
    if (!loggedUser.roles.find(role => role === "user" || role === "admin")) {
      body = {
        ...body,
        extensionist_id: ObjectId(loggedUser._id)
      };
    }

    conn = await useMongo();
    const Property = property(conn);

    const aggregateQuery = [
      {
        $lookup: {
          from: "product-types",
          localField: "productType_ids",
          foreignField: "_id",
          as: "productTypes"
        }
      },
      { $unwind: { path: "$productTypes", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: 1,
          producer_id: 1,
          extensionist_id: 1,
          address: 1,
          car: 1,
          pronaf: 1,
          area: 1,
          procuratorName: 1,
          ownerName: 1,
          owner_document: 1,
          createdBy: 1,
          history: 1,
          productType_ids: 1,
          position: 1,
          areas: 1,
          images: 1,
          "productTypes.name": 1,
          "productTypes._id": 1,
          "productTypes.averagePrice": 1
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
    castToObjectId(Property, strippedBody);
    aggregateQuery.unshift({
      $match: strippedBody
    });
    console.log(aggregateQuery);

    const paginate = Property.aggregatePaginate(
      Property.aggregate(aggregateQuery),
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
