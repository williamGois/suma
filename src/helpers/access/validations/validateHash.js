import generateHash from "./generateHash";

export default (hashed, value) => {
  const [algorithm, salt, hash] = hashed.split("$");
  const valueHashed = generateHash(value, salt);
  return hashed === valueHashed;
};
