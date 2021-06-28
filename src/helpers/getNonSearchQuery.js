export default body => {
  const strippedBody = { ...body };
  delete strippedBody.search;
  delete strippedBody.page;
  delete strippedBody.limit;
  delete strippedBody.skip;
  delete strippedBody.fields;
  return strippedBody;
};
