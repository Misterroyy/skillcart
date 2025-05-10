const Joi = require("joi");
const { join } = require("../config/db");

const userSchema = Joi.object({
  name: Joi.string().min(3).required(),
  interests:  Joi.string().min(3).required(),
  goals:  Joi.string().min(3).required(),
  role:  Joi.string().min(3).required(),
  weekly_time:  Joi.number(). integer().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

module.exports = {
  userSchema
};
