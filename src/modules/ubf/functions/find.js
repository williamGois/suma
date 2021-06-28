import useMongo, { closeConnection } from "../../../helpers/useMongo";
import ubf from "../../../models/ubf";
import validateAuthBearer from "../../../helpers/ValidateAuth/validateAuthBearer";
import getNonSearchQuery from "../../../helpers/getNonSearchQuery";
import castToObjectId from "../../../helpers/castToObjectId";

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const body = event.body && JSON.parse(event.body);
  let conn;
  try {
    validateAuthBearer(event.headers["Authorization"]);

    conn = await useMongo();
    const Ubf = ubf(conn);
    let query =
      !body.search || body.search === ""
        ? {}
        : body.fields.reduce(
            (payload, field) => {
              payload.$or.push({
                [field]: { $regex: new RegExp(body.search), $options: "i" }
              });
              return payload;
            },
            { $or: [] }
          );

    const strippedBody = getNonSearchQuery(body);
    castToObjectId(Ubf, strippedBody);
    query = { ...query, ...strippedBody };
    const found = await Ubf.paginate(query, {
      page: body.page || 1,
      limit: body.limit || 10
    });
    console.log("found", found);

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
