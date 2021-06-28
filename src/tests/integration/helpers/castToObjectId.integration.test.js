import castToObjectId from "./../../../helpers/castToObjectId";
import branch from "./../../../models/branch";
import useMongo, {
  ObjectId,
  closeConnection
} from "./../../../helpers/__mocks__/useMongo";

describe("Casts strings from a body in to objectIds according to the model", () => {
  it("Should cast the _id/branch_id field", async () => {
    const conn = await useMongo();
    const Branch = branch(conn);

    const body = {
      _id: "5e277174c47c32f4fc887b7b",
      business_id: "5e277174c47c32f4fc887b7c",
      contact_name: "somename",
      contact_email: "someemail"
    };

    castToObjectId(Branch, body);

    expect(body.business_id).toEqual(expect.any(ObjectId));

    expect(body._id).toEqual(expect.any(ObjectId));

    expect(body.contact_email).not.toEqual(expect.any(ObjectId));

    await closeConnection(conn);
  });
});
