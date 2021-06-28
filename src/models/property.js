import { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import addressSchema from "./subSchemas/address";

const schema = new Schema(
  {
    name: { type: String, required: true },
    producer_id: { type: Schema.Types.ObjectId, ref: "users" },
    extensionist_id: { type: Schema.Types.ObjectId, ref: "users" },
    address: { type: addressSchema },
    car: { type: String },
    pronaf: { type: String },
    area: { type: String },
    procuratorName: { type: String },
    ownerName: { type: String },
    owner_document: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "users" },
    history: { type: String },
    productType_ids: [{ type: Schema.Types.ObjectId, ref: "product-types" }],
    position: {
      type: Object
    },
    areas: {
      type: Array
    },
    images: [
      {
        id: String,
        imageName: String,
        s3uri: String,
        s3key: String,
        timestamp: { type: Date, default: Date.now }
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

schema.virtual("productTypes", {
  ref: "product-types", // The model to use
  localField: "productType_ids", // Find people where `localField`
  foreignField: "_id" // is equal to `foreignField`
});

schema.plugin(mongoosePaginate);
schema.plugin(mongooseAggregatePaginate);

export default conn => conn.model("properties", schema, "properties");
