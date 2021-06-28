import useMongo, { closeConnection, ObjectId } from "../../../helpers/useMongo";
import demand from "../../../models/demand";
import productType from "../../../models/productType";
import business from "../../../models/business";
import validateAuthBearer from "./../../../helpers/ValidateAuth/validateAuthBearer";

export const v1 = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const query = event.body && JSON.parse(event.body);
  let conn;
  try {
    const decryptedToken = validateAuthBearer(event.headers["Authorization"]);

    conn = await useMongo();
    const Demand = demand(conn);
    const ProductType = productType(conn);
    const Business = business(conn);

    const found = await Demand.findOne(query)
      .populate("business_id")
      .populate("items.productType_id")
      .lean();

    found.business = found.business_id;
    found.business_id = found.business._id;
    found.items = found.items.map(item => {
      const newItem = {
        ...item,
        productType: item.productType_id,
        productType_id: item.productType_id._id,
        productType_name: item.productType_id.name,
        productType_ncm: item.productType_id.ncmCode
      };
      return newItem;
    });

    console.log(found);
    console.log(found.items);

    await closeConnection(conn);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify(found)
    };
  } catch (error) {
    if (conn) {
      await closeConnection(conn);
    }
    console.log(error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify(error.message)
    };
  }
};
