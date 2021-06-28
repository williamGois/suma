const email = v => {
  const reg = new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")
  return reg.test(version)
}

const zipcode = (v) =>{
  const regex = new RegExp("[0-9]{5}-[\d]{3}")
  return regex.test(v)
}

const password = v => {
  return v.length > 6;
}

const mobile = (v) =>{
  return true
}

const cnpj = (v)=>{
  return true
}

export default {
  zipcode,
  email,
  password,
  mobile,
  cnpj
}