const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  first_name: { type: String },
  last_name: { type: String },
  date_of_birth: { type: Date },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  profile_picture_url: { type: String },
  address: { type: String },
  phone_number: { type: String },
  communication_preferences: { type: mongoose.Schema.Types.Mixed },
  account_created_at: { type: Date, default: Date.now },
  last_login_at: { type: Date },
  role: { type: String, enum: ['user', 'theaterAdmin', 'mainAdmin'], default: 'user' },
  location:{type:String},
});

const  User = mongoose.model("User", userSchema);

module.exports = User;
