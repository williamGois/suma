import address from "./../../../../models/subSchemas/address";
import { createPortal } from "react-dom";

describe("Address schema", () => {
  it("Should require state/city/street/number/zipcode", () => {
    const testOne = {
      zipcode: "somestring",
      city: "somestring",
      state: "somestring",
      street: "somestring",
      number: "somenumber",
      neighborhood: "somestring",
      complement: "somestring"
    };

    expect(address.validateSchema(testOne)).toBe(true);

    delete testOne.complement;

    expect(address.validateSchema(testOne)).toBe(true);

    delete testOne.street;

    expect(() => address.validateSchema(testOne)).toThrow();
  });
});
