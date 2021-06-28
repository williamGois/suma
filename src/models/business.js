import { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import addressSchema from "./subSchemas/address";

const schema = new Schema(
  {
    name: String,
    companyName: String,
    cnpj: String,
    contactName: String,
    email: String,
    preferInstallment: String,
    accountableUser: { type: Schema.Types.ObjectId, ref: "users" },
    address: { type: addressSchema }
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true
    }
  }
);

schema.plugin(mongoosePaginate);
schema.plugin(mongooseAggregatePaginate);

export default conn => conn.model("business", schema, "businesses");
