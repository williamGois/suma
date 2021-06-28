/**
 * Deve ser alterado para fazer testes de integração usando o mongodb em TEST ao invés de usar mongo in memoria.
 * Alterar todos os testes de integração para realizarem dessa forma
 */

// import { createConnection, Types } from "mongoose";
// // const { MongoMemoryServer } = require("mongodb-memory-server");

// const mongod = new MongoMemoryServer();
// const MONGODB_URI = mongod.getConnectionString();

// let conn;

// export default async () => {
//   if (conn) return conn;
//   conn = createConnection(await MONGODB_URI, {
//     bufferComands: false,
//     bufferMaxEntries: false,
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//   });
//   return conn;
// };

// const closeConnection = async conn => {
//   await conn.dropDatabase();
//   await conn.close();
//   await mongod.stop();
// };

// const ObjectId = Types.ObjectId;

// export { closeConnection, ObjectId };
