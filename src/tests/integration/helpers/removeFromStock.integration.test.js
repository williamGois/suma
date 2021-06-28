import removeFromStock from "../../../helpers/removeFromStock";
import productWallet from "../../../models/productWallet";
import order from "../../../models/order";
import useMongo, { closeConnection } from "../../../helpers/useMongo";
import { ObjectID } from "mongodb";

jest.mock("../../../helpers/useMongo");

afterEach(async () => {
  const mongoose = require("mongoose");
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

const setup = async () => {
  const conn = await useMongo();

  const testWallets = [
    {
      product_id: "5e214b40bbd686ee302cbcc9", //actually productType_id
      business_id: "5e214b40bbd686ee302cbcc8",
      transactions: [
        {
          quantity: 33
        }
      ]
    },
    {
      product_id: "5e214b40bbd686ee302cbcc7", //actually productType_id
      business_id: "5e214b40bbd686ee302cbcc6",
      transactions: [
        {
          quantity: 66
        }
      ]
    }
  ];

  const ProductWallet = productWallet(conn);

  for (let index = 0; index < testWallets.length; index++) {
    const newWallet = new ProductWallet({ ...testWallets[index] });
    const savedWallet = await newWallet.save(testWallets[index]);
    testWallets[index] = savedWallet;
  }

  return {
    conn,
    ProductWallet,
    testWallets
  };
};

describe("It creates a remove entry of the items specified in the order in the productWalltes", () => {
  it("Should add the negative value with the order_id", async () => {
    const { conn, testWallets, ProductWallet } = await setup();

    const testOrder = {
      _id: "5e214b40bbd686ee302cbcc4",
      branch_id: "5e214b40bbd686ee302cbcc9",
      business_id: "5e214b40bbd686ee302cbcc8",
      items: [
        {
          productWallet_id: testWallets[0]._id,
          quantity: 11
        },
        {
          productWallet_id: testWallets[1]._id,
          quantity: 57
        }
      ]
    };

    await removeFromStock(testOrder, ProductWallet);

    const updatedProductWalletOne = await ProductWallet.findById(
      testWallets[0]._id
    ).lean();

    const updatedProductWalletTwo = await ProductWallet.findById(
      testWallets[1]._id
    ).lean();

    await closeConnection(conn);

    await expect(updatedProductWalletOne.transactions).toContainEqual(
      expect.objectContaining({
        quantity: -11,
        order_id: ObjectID(testOrder._id)
      })
    );

    await expect(updatedProductWalletTwo.transactions).toContainEqual(
      expect.objectContaining({
        quantity: -57,
        order_id: ObjectID(testOrder._id)
      })
    );
  });
});
