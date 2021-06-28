import ubf from "../../../../models/ubf";
import useMongo, { closeConnection } from "../../../../helpers/useMongo";
import validateAuthBearer from "../../../../helpers/ValidateAuth/validateAuthBearer";

import { v1 as find } from "../../../../modules/ubf/functions/find";

jest.mock("../../../../helpers/useMongo");
jest.mock("../../../../helpers/ValidateAuth/validateAuthBearer");

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

  const testUbfs = [
    {
      name: "name0",
      isActive: false
    },
    {
      name: "name0",
      isActive: true
    },
    {
      name: "name1",
      isActive: true
    },
    {
      name: "name1",
      isActive: false
    }
  ];

  const Ubf = ubf(conn);

  for (let index = 0; index < testUbfs.length; index++) {
    const newWallet = new Ubf({ ...testUbfs[index] });
    const savedWallet = await newWallet.save(testUbfs[index]);
    testUbfs[index] = savedWallet;
  }

  return {
    conn,
    Ubf,
    testUbfs
  };
};

describe("It finds by regex and match params", () => {
  it("Do the right query with regex on name and isActive:true", async () => {
    const { conn, testUbfs, ProductWallet } = await setup();

    validateAuthBearer.mockImplementation(b => {
      if (!b)
        throw new Error(
          JSON.stringify({
            code: "UP03",
            message: "Authorization not permitted"
          })
        );
    });

    const query = {
      search: "1",
      isActive: true,
      fields: ["name"]
    };

    const args = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer lalal`
      },
      body: JSON.stringify(query)
    };

    const response = await find(args, {});
    expect(response.statusCode).toBe(200);
    const parsed = await JSON.parse(response.body);

    expect(parsed.total).toBe(1);
    expect(parsed.docs[0]).toEqual(
      expect.objectContaining({
        isActive: true,
        name: "name1"
      })
    );
  });
});
