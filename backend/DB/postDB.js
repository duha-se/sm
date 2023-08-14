const mongoose = require("mongoose");
const Posts = new mongoose.Schema({
  // userId: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  userName: String,
  content: String,
  img: String,
  date: Date,
  time: String,
  // author: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
});

const Post = mongoose.model("Post", Posts);

module.exports = Post;
