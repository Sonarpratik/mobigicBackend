const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const fileSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  six_digit_code: { type: String, required: true },
  file: { type: String },


 
});

//we are hashing the password


const File = mongoose.model("FILE", fileSchema);
module.exports = File;
