import { Schema, mongo } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const processingTypeList = ["industrialized", "minimallyProcessed", "inNatura"]
const productionTipeList = ["organic", "agroecological", "convencional"]

const schema = new Schema(
  {
    isActive: { type: Boolean, default: true },
    product_id: { type: Schema.Types.ObjectId, ref: "product-types" },
    property_id: { type: Schema.Types.ObjectId, ref: "properties" },
    producer_id: { type: Schema.Types.ObjectId, ref: "users" },
    price: Number,
    processingType: { type: String, enum: processingTypeList },
    productionType: { type: String, enum: productionTipeList },
    transactions: [
      {
        quantity: Number,
        harvestedAt: Date,
        order_id: { type: Schema.Types.ObjectId, ref: "orders" },
        createdAt: { type: Date, default: Date.now }
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

export default conn => conn.model("product-wallets", schema, "product-wallets");
