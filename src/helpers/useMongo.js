import { createConnection, Types } from "mongoose";
const MONGODB_URI = process.env.MONGODB_URI;

export default () => {
  return createConnection(MONGODB_URI, {
    bufferComands: false,
    bufferMaxEntries: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
};

const closeConnection = conn => {
  return conn.close();
};

const ObjectId = Types.ObjectId;

export { closeConnection, ObjectId };
