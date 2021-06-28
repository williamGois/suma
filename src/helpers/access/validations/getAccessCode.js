import getCode from "./getCode";
import moment from "moment";

export default () => {
  return {
    code: getCode(),
    expirationDate: moment(new Date())
      .add(1, "d")
      .toISOString()
  };
};
