import { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import addressSchema from "./subSchemas/address";

const validateSchema = body => {
  console.log("validation", body);
  if (!body.name) throw new Error("A filial deve ter nome");
  console.log("passed");
  addressSchema.validateSchema(body.address);

  return true;
};

const schema = new Schema(
  {
    name: String, //required
    cnpj: String,
    contact_name: String,
    contact_email: String,
    business_id: { type: Schema.Types.ObjectId, ref: "business" },
    address: { type: addressSchema },
    deliveryWindows: [
      {
        from: Number, //4 numbers HHMM 24hrs format
        to: Number, //4 numbers HHMM 24hrs format
        weekday: Number //0-6 sunday-saturday
      }
    ]
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

export default conn => conn.model("branches", schema, "branches");
