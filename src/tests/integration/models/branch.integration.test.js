import branch from "../../../models/branch";
import useMongo, {
  closeConnection
} from "./../../../helpers/__mocks__/useMongo";

describe("Branch model", () => {
  it("Should require name/address", async () => {
    const conn = await useMongo();
    const Branch = branch(conn);

    const testOne = {
      name: "somestring", //required
      cnpj: "somestring",
      contact_name: "somestring",
      contact_email: "somestring",
      business_id: "someid",
      address: {
        zipcode: "somestring",
        city: "somestring",
        state: "somestring",
        street: "somestring",
        number: "somenumber",
        neighborhood: "somestring",
        complement: "somestring"
      },
      deliveryWindows: [
        {
          from: 1650, //4 1650s HHMM 24hrs format
          to: 1650, //4 1650s HHMM 24hrs format
          weekday: 2 //0-6 sunday-saturday
        }
      ]
    };

    expect(Branch.validateSchema(testOne)).toBe(true);

    delete testOne.contact_name;

    expect(Branch.validateSchema(testOne)).toBe(true);

    delete testOne.name;

    expect(() => Branch.validateSchema(testOne)).toThrow();

    testOne.name = "somestring";
    delete testOne.address;

    expect(() => Branch.validateSchema(testOne)).toThrow();

    await closeConnection(conn);
  });
});
