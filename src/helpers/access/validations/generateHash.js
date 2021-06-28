import crypto from "crypto";

export default (password, preSalt) => {
  const algorithm = "sha256";
  const salt = preSalt || crypto
    .randomBytes(Math.ceil(8))
    .toString("hex")
    .slice(0, 16);
  const hash = crypto.createHmac(algorithm, salt);
  hash.update(password);
  return [algorithm, salt, hash.digest("hex")].join("$");
};
