const mongoose = require("mongoose");
const regxName = function (val) {
  let regx = /^[a-zA-Z]+([\s][a-zA-Z]+)*$/;
  return regx.test(val);
}

//=====================================VALIDATING TYPE NUMBER=============================================//

const validateNumber = function validateNumber(value) {
  if (typeof value == "number") {
    return true;
  }
  return false;
};

//=======================================VALIDATING EMPTY STRING============================================//

const validateString = function (name) {
  if (typeof name == "undefined" || typeof name == null) return false;
  if (typeof name == "string" && name.trim().length == 0) return false;

  return true;
};


//====================================VALIDATING EMAIL==================================================//

const validateEmail = function (value) {
  let re = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
  let validEmail = re.test(value);

  if (!validEmail) {
    return false;
  }

  return true;
};

//====================================VALIDATING PASSWORD==================================================//

const validatePassword = function (value) {
  let regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9!@#$%^&*]{8,15})$/
  return regex.test(value)
}

//================================VALIDATING EMPTY OBJECT=================================================//

const validateRequest = function (value) {
  return Object.keys(value).length == 0
};

//====================================VALIDATING OBJECTID==================================================//


let validateObjectId = function (ObjectId) {
  return mongoose.isValidObjectId(ObjectId)
}

//===============================VALIDATING PASSWORD LENGTH=================================================//


const passwordLength = function (password) {
  if (password.length >= 8 && password.length <= 15) {
    return true;
  } else return false;
};

//====================================VALIDATING PHONE NUMBER==================================================//


const regexPhoneNumber = function (val) {
  let regx = /^(?:(?:\+|0{0,2})91(\s*|[\-])?|[0]?)?([6789]\d{2}([ -]?)\d{3}([ -]?)\d{4})$/
  return regx.test(val);
}

//====================================VALIDATING PINCODE==================================================//


const isValidPincode = function (val) {
  return ((typeof val=="number" &&  val.toString().length == 6) || (typeof val=="string" &&val.length == 6))
}


//====================================VALIDATING 0 IN PINCODE==================================================//

const startWithZero=function(val){
  return (typeof val=="number" && (val.toString())[0] == "0")|| (typeof val=="string" && val[0] == "0")
}

//====================================VALIDATING IMAGE EXTENSION==================================================//


const imageExtValidator = function (val) {
  let regex = /\.(gif|jpe?g|tiff?|png|webp|bmp|jpg|JPG)$/
  return regex.test(val)
}

//====================================VALIDATING WHOLE NUMBER==================================================//


function onlyWholeNumbers(str) {
  return /^[0-9]+$/.test(str);
}

//====================================VALIDATING DECIMAL NUMBERS==================================================//


function decNumbers(str) {
  return /^[0-9.]+$/.test(str);
}


module.exports = {
  validateString,
  validateEmail,
  validatePassword,
  validateRequest,
  validateNumber,
  validateObjectId,
  passwordLength,
  regexPhoneNumber,
  regxName,
  isValidPincode,
  imageExtValidator,
  onlyWholeNumbers,
  decNumbers,
  startWithZero
};