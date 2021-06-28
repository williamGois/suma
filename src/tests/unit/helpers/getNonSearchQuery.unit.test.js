import getNonSearchQuery from "./../../../helpers/getNonSearchQuery";

describe("Strips out the regex search and pagination fields and leaves the match fields", () => {
  it("Should strip out .search/.page/.limit./.skip/.fields", () => {
    const body = {
      search: "Some search string",
      page: 2,
      limit: 15,
      skip: 30,
      fields: ["name", "email"],
      curated: true,
      _id: "someid"
    };

    const strippedBody = getNonSearchQuery(body);

    expect(strippedBody).not.toEqual(
      expect.objectContaining({
        search: expect.anything,
        page: expect.anything,
        limit: expect.anything,
        skip: expect.anything,
        fields: expect.anything
      })
    );

    expect(strippedBody).toEqual({
      curated: true,
      _id: "someid"
    });
  });
});

// const strippedBody = { ...body };
// delete strippedBody.search;
// delete strippedBody.page;
// delete strippedBody.limit;
// delete strippedBody.skip;
// delete strippedBody.fields;
// return strippedBody;
