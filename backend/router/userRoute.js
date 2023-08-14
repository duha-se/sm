const express = require("express");
const router = express.Router();
const UserController = require("./UserController");

// Create a new user
router.post("/newUser", UserController.create);
//login
router.post("/login", UserController.login);
// Retrieve all users
router.get("/users", UserController.findAll);

// Retrieve a single user with userId
router.get("/users/:id", UserController.findOne);
router.get("/users/:id/followingList", UserController.followingList);
router.post("/users/:loggedInUserId/followUser", UserController.followUser);
// Update a user with email
router.put("/users/:email", UserController.update);

// Delete a user with userId
router.delete("/users/:userId", UserController.remove);

module.exports = router;
