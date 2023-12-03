// 6
const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { config } = require("../config/secret");
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  date_created: {
    type: Date,
    default: Date.now()
  },
  role: {
    type: String,
    default: 'user'
  }
})
exports.UserModel = mongoose.model("users", userSchema);

exports.userValid = (_bodyValid) => {
  let joiSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    // email() -> בודק שגם האימייל לפי תבנית מייל
    email: Joi.string().min(2).max(100).email().required(),
    password: Joi.string().min(6).max(50).required(),
  })
  return joiSchema.validate(_bodyValid);
}

exports.loginValid = (_bodyValid) => {
  let joiSchema = Joi.object({
    email: Joi.string().min(2).max(100).email().required(),
    password: Joi.string().min(6).max(50).required(),
  })
  return joiSchema.validate(_bodyValid);
}

userSchema.pre(/^update/, async (req, res, next) => {
  let tokenData = jwt.verify(req.tokenData, config.tokenSecret);
  let data = await ToyModel.findOne({ _id: idEdit });
  if (tokenData._role != "admin" && data.user_id != tokenData.id) {
    console.log("Error updating, You are trying to do an operation that is not enabled!");
    res.status(555).json({ msg: "Error updating, You are trying to do an operation that is not enabled!" })
    return;
  }
  next();
})

exports.createToken = (user_id, _role) => {
  let token = jwt.sign({ user_id, _role }, config.tokenSecret, { expiresIn: "6000mins" });
  return token;
}