import jwt from "jsonwebtoken";
import moment from "moment";

export default user => {
  const claim = {
    issuer: "AUTH",
    subject: user._id.toString(),
    audience: "access-service"
  };

  const token = jwt.sign(
    { user: JSON.stringify(user) },
    process.env.rsa_private_key,
    {
      ...claim,
      algorithm: "RS256",
      expiresIn: moment(new Date()).unix() + 60 * 60 + 2
    }
  );

  return { token, claim };
};
