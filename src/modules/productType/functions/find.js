import jwt from "jsonwebtoken";
import useMongo, { closeConnection } from "../../../helpers/useMongo";
import productType from "../../../models/productType";
import validateAuthBearer from "./../../../helpers/ValidateAuth/validateAuthBearer"

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const body = event.body && JSON.parse(event.body);
  let conn;

  try {
    validateAuthBearer(event.headers["Authorization"]);

    conn = await useMongo();
    const ProductType = productType(conn);
    let query =
      !body.search || body.search === ""
        ? {}
        : body.fields.reduce(
            (payload, field) => {
              console.log("payload",payload);
              payload.$or.push({
                [field]: { $regex: new RegExp(body.search), $options: "i" }
              });
              return payload;
            },
            { $or: [] }
          );
    console.log("body", body)
    console.log("query",query);
    const strippedBody = {...body}
    delete strippedBody.search
    delete strippedBody.page
    delete strippedBody.limit
    delete strippedBody.skip
    delete strippedBody.fields
    query = {...query,...strippedBody}
    console.log("QUERY2",query)
    const found = await ProductType.paginate(query, {
      page: body.page || 1,
      limit: body.limit || 10
    });
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
