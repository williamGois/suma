import { Schema } from "mongoose";
import validators from "./../../helpers/validators"

const schema = new Schema({
  extensionist_id: { type: Schema.Types.ObjectId, ref: "users" },
});

export default schema

