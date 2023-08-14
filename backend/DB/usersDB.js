const mongoose = require("mongoose");

const users = new mongoose.Schema(
  {
    // id: String,
    email: { type: String, required: true, unique: true },
    password: String,
    userName: { type: String, required: true, unique: true },
    gender: String,
    BD: Date,
    bio: String,
    img: String,
    // posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
  }
  // {
  //   timestamps: true,
  // }
);

const Users = mongoose.model("Users", users);

module.exports = Users;
