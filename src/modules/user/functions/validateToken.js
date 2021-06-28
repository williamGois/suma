import jwt from "jsonwebtoken";

export const v1 = async (event, context) => {
  try {
    const auth = event.headers.Authorization;
    if (!auth) {
      throw new Error("Missing Token");
    }
    const token = event.headers.Authorization.split("Bearer ")[1];
    console.log("HAS TOKEN")
    const verified = jwt.verify(token, process.env.rsa_public_key);
    console.log("VERIFIED")
    if (!verified) {
      throw new Error("Invalid Token");
    }
    console.log("CHECK TIME")

    if (verified.exp >= new Date().getTime()) {
      throw new Error("Expired Token");
    }
    console.log("RETURN")

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      }
    };
  } catch (error) {
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
