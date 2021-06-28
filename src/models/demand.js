import { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const schema = new Schema(
  {
    branch_id: { type: Schema.Types.ObjectId, ref: "branches" },
    business_id: { type: Schema.Types.ObjectId, ref: "business" },
    curated: { type: Boolean, default: false },
    items: [
      {
        productType_id: { type: Schema.Types.ObjectId, ref: "product-types" },
        price: Number,
        productType_name: String,
        productType_ncm: String,
        fees: {
          taxes: Number,
          profit: Number,
          logisticsFee: Number,
          producerFee: Number
        }
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

export default conn => conn.model("demands", schema, "buy-orders");
