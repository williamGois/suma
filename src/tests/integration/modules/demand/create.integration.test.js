import { v1 as create } from "../../../../modules/demand/functions/create";
import validateAuthBearer from "../../../../helpers/ValidateAuth/validateAuthBearer";

jest.mock("../../../../helpers/ValidateAuth/validateAuthBearer.js");

jest.mock("../../../../helpers/useMongo");

afterEach(async () => {
  const mongoose = require("mongoose");
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

describe("It creates a new demand", () => {
  it("Should save correctly on de db", async () => {
    validateAuthBearer.mockImplementation(authBearer => {
      if (!authBearer)
        throw new Error(
          JSON.stringify({
            code: "UP03",
            message: "Authorization not permitted"
          })
        );
    });

    const demand = {
      branch_id: "5e214b40bbd686ee302cbcc9",
      business_id: "5e214b40bbd686ee302cbcc8",
      items: [
        {
          productType_id: "5e214b40bbd686ee302cbcc6",
          price: 1234
        }
      ]
    };

    const args = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer lalal`
      },
      body: JSON.stringify(demand)
    };

    const response = await create(args, {});
    expect(response.statusCode).toBe(200);
    const parsed = await JSON.parse(response.body);
    expect(parsed).toEqual(
      expect.objectContaining({
        branch_id: "5e214b40bbd686ee302cbcc9",
        business_id: "5e214b40bbd686ee302cbcc8"
      })
    );

    expect(parsed.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          productType_id: "5e214b40bbd686ee302cbcc6",
          price: 1234
        })
      ])
    );
  });
});
