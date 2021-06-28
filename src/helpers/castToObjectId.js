import mongoose from "mongoose";

export default (model, query) => {
  for (let key in query) {
    if (model.schema.path(key).instance == "ObjectID") {
      query[key] = mongoose.Types.ObjectId(query[key]);
    }
  }
};
