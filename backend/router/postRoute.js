const express = require("express");
const router = express.Router();
const PostController = require("./PostController");

// Create a new post
router.post("/newPost", PostController.create);

// Retrieve all post
router.get("/posts", PostController.findAll);

// Retrieve a single post with userId
router.get("/posts/:userId", PostController.findPost);
router.get("/posts/:userId/followingPosts", PostController.followingPosts);
// Update a post with userId
router.put("/posts/:postId", PostController.update);

// Delete a post with contactId
router.delete("/posts/:postId", PostController.remove);

module.exports = router;
