
const mongoose = require("mongoose");
const Joi = require("joi");


const toySchema = new mongoose.Schema({
    name: String,
    info: String,
    category: String,
    img_url: String,
    price: Number,
    date_created: {
        type: Date, default: Date.now()
    },
    user_id: String
})

exports.ToyModel = mongoose.model("toys", toySchema);

exports.toyValid = (_bodyValid) => {
    let joiSchema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        info: Joi.string().min(2).max(200).required(),
        category: Joi.string().min(2).max(100).required(),
        img_url: Joi.string().min(2).max(300).required(),
        price: Joi.number().min(1).max(2000).required()
    })
    return joiSchema.validate(_bodyValid);
}



