import { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const schema = new Schema(
  {
    buyOrder_id: { type: Schema.Types.ObjectId, ref: "buy-orders" },
    items: [
      {
        productType_id: { type: Schema.Types.ObjectId, ref: "product-types" },
        product_id: { type: Schema.Types.ObjectId, ref: "product-wallets" },
        property_id: { type: Schema.Types.ObjectId, ref: "properties" },
        productType_name: String,
        price: Number,
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

export default conn => conn.model("buy-order-fulfills", schema);
