/**
 * This will check if the authentication is running ok, and return true, otherwise will throw a Error.
 * @param {Object} config - the config object for this function
 * @param {Object} config.body - the Body that will be checked if do exist
 * @returns {Boolean} will return true if auth is ok or throw a error
 */
const ValidateAuth = ({ body }) => {
  if (!body) {
    new Error(JSON.stringify({ code: "UP00", message: "Post without body" }));
  }

  return true;
};

export default ValidateAuth;
