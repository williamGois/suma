import { Schema } from "mongoose";
import validators from "./../../helpers/validators";

const validateSchema = body => {
  if (!body) throw new Error("Endereço é obrigatório");
  if (!body.city) throw new Error("Endereço deve ter cidade");
  if (!body.state) throw new Error("Endereço deve ter estado");
  if (!body.street) throw new Error("Endereço deve ter rua");
  if (!body.number) throw new Error("Endereço deve ter numero");
  if (!body.zipcode) throw new Error("Endereço deve ter CEP");

  return true;
};

const schema = new Schema({
  _id: { auto: false },
  zipcode: { type: String },
  city: { type: String },
  state: { type: String },
  street: { type: String },
  number: { type: Number },
  neighborhood: { type: String },
  complement: { type: String }
});

schema.validateSchema = validateSchema;

export default schema;
