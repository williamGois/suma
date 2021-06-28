import { v1 } from "../../../../modules/branch/functions/create";
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

describe("It creates a new branch", () => {
  it("Should save correctly on de db", async () => {
    validateAuthBearer.mockImplementation(b => {
      if (!b)
        throw new Error(
          JSON.stringify({
            code: "UP03",
            message: "Authorization not permitted"
          })
        );
    });

    const branch = {
      name: "test name",
      cnpj: "12312312312312",
      business_id: "5e214b40bbd686ee302cbcc8",
      contact_name: "test contact_name",
      contact_email: "test contact_email",
      address: {
        street: "test street",
        zipcode: "12312312",
        state: "13",
        city: "1300086",
        number: "123",
        complement: "test complement",
        neighborhood: "test neighborhood"
      }
    };

    const args = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer lalal`
      },
      body: JSON.stringify(branch)
    };

    const response = await v1(args, {});
    expect(response.statusCode).toBe(200);
    const parsed = await JSON.parse(response.body);
    expect(parsed).toEqual(
      expect.objectContaining({
        name: "test name",
        cnpj: "12312312312312",
        business_id: "5e214b40bbd686ee302cbcc8",
        contact_name: "test contact_name",
        contact_email: "test contact_email",
        deliveryWindows: [],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        address: {
          street: "test street",
          zipcode: "12312312",
          state: "13",
          city: "1300086",
          number: 123,
          complement: "test complement",
          neighborhood: "test neighborhood"
        }
      })
    );
  });
});
