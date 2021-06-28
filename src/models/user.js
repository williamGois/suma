import { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import addressSchema from "./subSchemas/address";
import adminSchema from "./subSchemas/admin";
import buyerSchema from "./subSchemas/buyer";
import extensionistSchema from "./subSchemas/extensionist";
import producerSchema from "./subSchemas/producer";
import validators from "./../helpers/validators";

const schema = new Schema(
  {
    name: String,
    email: String,
    password: String,
    isActive: Boolean,
    accessCode: Object,
    mobile: String,
    address: { type: addressSchema },
    document: String,
    createdBy: { type: Schema.Types.ObjectId, ref: "users" },
    history: String,
    roles: [String],
    images: [
      {
        id: String,
        imageName: String,
        s3uri: String,
        s3key: String,
        timestamp: { type: Date, default: Date.now }
      }
    ],
    admin: { type: adminSchema, required: false },
    buyer: { type: buyerSchema, required: false },
    producer: { type: producerSchema, required: false },
    extensionist: { type: extensionistSchema, required: false }
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true
    }
  }
);

schema.plugin(mongoosePaginate);

export default conn => conn.model("users", schema, "users");
