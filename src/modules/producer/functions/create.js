import emailValidator from "../../../helpers/regex/validators/email";
import useMongo, { closeConnection } from "../../../helpers/useMongo";
import user from "../../../models/user";
import getAccessCode from "../../../helpers/access/validations/getAccessCode";
import sendUserCodeEmail from "../../../helpers/sender/emails/user/sendCode";
import validateAuthBearer from "./../../../helpers/ValidateAuth/validateAuthBearer";

const validateBody = body => {
  if (!(body && emailValidator(body.email))) {
    throw new Error("Email not in a valid format");
  }
};

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const body = event.body && JSON.parse(event.body);
  let conn;
  try {
    const decryptedToken = validateAuthBearer(event.headers["Authorization"]);
    
    const loggedUser = JSON.parse(decryptedToken.user);
    body.createdBy = loggedUser._id;

    validateBody(body);

    conn = await useMongo();
    const User = user(conn);

    const connectedUser = new User({
      ...body,
      isActive: false,
      accessCode: getAccessCode(),
      roles: ["producer"]
    });

    const savedUser = await connectedUser.save();
    
    if (savedUser.email) {
      await sendUserCodeEmail(savedUser);
    }

    await closeConnection(conn);
    delete savedUser.accessCode;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify(savedUser)
    };
  } catch (error) {
    if (conn) {
      await closeConnection(conn);
    }
    
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
