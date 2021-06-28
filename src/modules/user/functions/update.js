import jwt from "jsonwebtoken";
import useMongo, { closeConnection } from "../../../helpers/useMongo";
import user from "../../../models/user";
import generateToken from "../../../helpers/access/token/generate";
import validateAuthBearer from "./../../../helpers/ValidateAuth/validateAuthBearer"

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const body = JSON.parse(event.body);
  let conn;
  try {
    const decryptedToken = validateAuthBearer(event.headers["Authorization"]);


    conn = await useMongo();
    const User = user(conn);

    const { _id } = body;
    delete body._id;
    const updated = await User.findByIdAndUpdate( _id , body, {lean:true,new:true});
    delete updated.password;

    const { token: newToken, claim } = generateToken(updated);

    await closeConnection(conn);
    return {
      statusCode: 200,
      body: JSON.stringify({ token: newToken, user:updated }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Set-Cookie": `claim=${encodeURIComponent(
          JSON.stringify({
            ...claim,
            ip: event.requestContext.identity.sourceIp,
            agent: event.requestContext.identity.userAgent
          })
        )}`
      }
    };
  } catch (error) {
    console.log(error);
    if(conn){
      closeConnection(conn)
    }
    return { 
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify(error.message) };
  }
};
