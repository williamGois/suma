import { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import {
  plugin as autoInc,
  initialize as initAutoInc
} from "mongoose-auto-increment";

const schema = new Schema(
  {
    isActive: { type: Boolean, default: true },

    order_num: { type: Number },
    // demand_id: { type: Schema.Types.ObjectId, ref: "demand" }, @victor talvez incluir isso aq
    business_id: { type: Schema.Types.ObjectId, ref: "businesses" },
    branch_id: { type: Schema.Types.ObjectId, ref: "branches" },
    ubf_id: { type: Schema.Types.ObjectId, ref: "ubfs" },
    items: [
      {
        productWallet_id: {
          type: Schema.Types.ObjectId,
          ref: "product-wallets"
        },
        quantity: Number
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

export default conn => {
  initAutoInc(conn);
  schema.plugin(autoInc, { model: "order", field: "order_num" });
  return conn.model("order", schema, "orders");
};
