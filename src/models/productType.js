import { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";

const schema = new Schema(
  {
    isActive: { type: Boolean, default: true },

    name: String,
    family: String,
    code: String,

    ncmCode: String,
    cestCode: String,
    eanCode: String,
    perishability: Number,

    averagePrice: Number,
    measurementUnit: String,
    stock: Number,

    createdBy: { type: Schema.Types.ObjectId, ref: "users" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "users" }
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true
    }
  }
);
schema.plugin(mongoosePaginate);

export default conn => conn.model("product-types", schema, "product-types");
