  const mongoose = require("mongoose");
  const Schema = mongoose.Schema;
  const UserSchema = new Schema(
    {
      username: { type: String, required: true, unique: true, trim: true },
      password: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      profileImage: { type: String, default: "" }, 
      gender: { type: String, enum: ["Male", "Female", "Other"], default: "Male" },
      mobileNumber: { type: String, trim: true },
      dateOfBirth: { type: Date },
      address: { type: String, trim: true }, 
      date: { type: Date, default: Date.now },
    },
    {
      timestamps: true,
    }
  );

  const User = mongoose.model("User", UserSchema);

  module.exports = User;


 