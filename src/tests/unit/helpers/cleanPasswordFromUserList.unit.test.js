import cleanPassword from "../../../helpers/cleanPasswordFromUserlist";

describe("cleanPasswordFromUserList.js", () => {
  const baseUserList = [
    { _id: "123", password: "123" },
    { _id: "123", password: "123" },
    { _id: "123", password: "123" }
  ];

  test("Is removed?", () => {
    const cleanedUserlist = cleanPassword(baseUserList);
    cleanedUserlist.map(user => expect(user.password).toBeFalsy());
  });
});
