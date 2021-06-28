import { Schema } from "mongoose";
import validators from "./../../helpers/validators"

const schema = new Schema({
  _id:{auto:false},
  cnpj: String,
  deliverWindows:[
    {
      weekDay: Number, //1-7 from sunday-saturday
      since: Number, //seconds since 00:00
      until: Number
    }
  ]
});

export default schema
