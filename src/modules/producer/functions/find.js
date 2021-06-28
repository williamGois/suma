import useMongo, { closeConnection, ObjectId } from "../../../helpers/useMongo";
import user from "../../../models/user";
import validateAuthBearer from "./../../../helpers/ValidateAuth/validateAuthBearer";

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
        "producer.extensionist_id": ObjectId(loggedUser._id)
      };
    }

    conn = await useMongo();
    const User = user(conn);
    console.log("body", body);
    let query =
      !body.search || body.search === ""
        ? {}
        : body.fields.reduce(
            (payload, field) => {
              console.log(payload);
              payload.$or.push({
                [field]: { $regex: new RegExp(body.search), $options: "i" }
              });
              return payload;
            },
            { $or: [] }
          );

    query.roles = "producer";
    const strippedBody = { ...body };
    delete strippedBody.search;
    delete strippedBody.page;
    delete strippedBody.limit;
    delete strippedBody.skip;
    delete strippedBody.fields;
    query = { ...query, ...strippedBody };

    console.log(query);
    const found = await User.paginate(query, {
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
