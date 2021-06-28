import { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import addressSchema from "./subSchemas/address";

const validateSchema = body => {
  if (!body.name) throw new Error("A UBF deve ter nome");
  addressSchema.validateSchema(body.address);
  return true;
};

const schema = new Schema(
  {
    isActive: { type: Boolean, default: true },

    name: String, //required
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

schema.statics.validateSchema = validateSchema;

export default conn => conn.model("ubfs", schema, "ubfs");
