//const { default: mongoose } = require("mongoose");
const Post = require("../DB/postDB");
const mongoose = require("mongoose");
const User = require("../DB/usersDB");
// Create and Save a new post
exports.create = async (req, res) => {
  //Validate request
  //   if (!req.body.content) {
  //     //check if the request is empty -nothing 2 add ...
  //     return res.status(400).json({
  //       message: "content can not be empty",
  //     });

  // console.log("reqBody:", req.body);
  const currentDate = new Date();
  // console.log(currentDate);
  // console.log("Received data from the frontend:", req.body);
  const newPost = new Post({
    userId: req.body.userId,
    userName: req.body.userName,
    content: req.body.content,
    img: req.body.img,
    date: currentDate.toISOString().split("T")[0],
    time: currentDate.toLocaleTimeString("en-US"),
  });
  // console.log("Data to be saved in the database:", newPost);
  // console.log("reqBody:", req.body);
  newPost
    .save()
    .then((data) => {
      // console.log("post saved successfully:", data);
      const postId = data._id; // Get the generated ObjectId
      // console.log("userID: ", postId);
      res.status(200).json({ data, postId });
    })
    .catch((err) => {
      console.error("Error saving post:", err);
      res.status(500).json({
        message: err.message || "Some error occurred while creating the post.",
      });
    });
};

// Retrieve and return all posts from the database.
exports.findAll = (req, res) => {
  Post.find()
    .then((posts) => {
      res.send(posts);
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message || "Some error occurred while retrieving posts.",
      });
    });
};

// Find a single useer with a userName
exports.findPost = async (req, res) => {
  const userId = req.params.userId;
  // console.log("userId = ", req.params);
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid user ObjectId" });
  }
  Post.find({ userId })
    .then((posts) => {
      if (!posts) {
        return res.status(400).send({
          message: "posts not found with userId " + userId,
        });
      }
      res.status(200).json({ posts: posts });
      console.log("posts", posts);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving user with the given ID.",
      });
    });
};
// API endpoint to get posts from people the user is following
exports.followingPosts = async (req, res) => {
  try {
    const userId = req.params.userId;

    const currentUser = await User.findById(userId).populate(
      "following",
      "userName"
    );

    if (!currentUser) {
      return res.status(400).json({ error: "User not found" });
    }
    // console.log(currentUser);
    const followingIds = currentUser.following.map((user) => user._id);

    const followingPosts = await Post.find({ userId: { $in: followingIds } });

    res.json(followingPosts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching following posts" });
  }
};

// Update a user identified by the email in the request
exports.update = (req, res) => {
  const postId = req.params.postId;
  const updatedContent = req.body.content;

  // Find user and update it with the request body
  Post.findByIdAndUpdate(
    postId,
    {
      content: updatedContent,
      // img: req.body.img,
    },
    { new: true }
  )
    .then((data) => {
      if (!data) {
        return res.status(400).send({
          message: "Post not found with postId " + req.params.postId,
        });
      }
      return res.status(200).json(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(400).send({
          message: "User not found with postId " + req.params.postId,
        });
      }
      return res.status(500).send({
        message: "Error updating post with postId " + req.params.postId,
      });
    });
};

// Delete a user with the specified email in the request
exports.remove = (req, res) => {
  const postId = req.params.postId;
  Post.findByIdAndRemove(postId)
    .then((data) => {
      if (!data) {
        return res.status(400).send({
          message: "User not found with userId " + postId,
        });
      }
      res.send({ message: "User deleted successfully!" });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(400).send({
          message: "User not found with userId " + postId,
        });
      }
      return res.status(500).send({
        message: "Could not delete user with userId " + postId,
      });
    });
};
