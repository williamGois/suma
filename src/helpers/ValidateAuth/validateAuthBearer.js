import jwt from "jsonwebtoken";

/**
 * This will check if the authentication is running ok, and return true, otherwise will throw a Error.
 * @param {String} AuthBearer - This is the bearer header on the request. On the event of a serverless function the Auth bearer can be find in the event.headers["Authorization"]
 * @returns {Object} will return the object fron the decryption
 */
const ValidateAuth = AuthBearer => {
  const token = AuthBearer && AuthBearer.split("Bearer ")[1];
  const isValidToken = jwt.verify(token, process.env.rsa_public_key);

  if (!AuthBearer || !token) {
    throw new Error(
      JSON.stringify({ code: "UP03", message: "Authorization not permitted" })
    );
  }

  if (!isValidToken) {
    throw new Error(
      JSON.stringify({ code: "UP03", message: "Authorization not permitted" })
    );
  }

  return isValidToken;
};

export default ValidateAuth;
