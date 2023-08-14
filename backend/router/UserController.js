//const { default: mongoose } = require("mongoose");
const User = require("../DB/usersDB");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
// Create and Save a new user
exports.create = async (req, res) => {
  //Validate request
  if (!req.body.email && !req.body.userName) {
    //check if the request is empty -nothing 2 add ...
    return res.status(400).json({
      message: "user email and Name can not be empty",
    });
  }
  const { email, userName } = req.body;

  // Check if the email and userName already exist in the database
  const existingUser = await User.findOne({ $or: [{ email }, { userName }] });

  if (existingUser) {
    return res.status(409).json({
      error: "Email or username already exists. Please use a different one.",
    });
  }

  // console.log("Received data from the frontend:", req.body);
  const newUser = new User({
    email: req.body.email,
    password: req.body.password,
    userName: req.body.userName,
    gender: req.body.gender,
    BD: req.body.BD,
    bio: req.body.bio,
    img: req.body.img,
  });
  //   console.log("Data to be saved in the database:", newUser);

  newUser
    .save()
    .then((data) => {
      //   console.log("User saved successfully:", data);
      const userId = data._id; // Get the generated ObjectId
      console.log("userID: ", userId);
      res.status(200).json({ data, userId });
    })
    .catch((err) => {
      console.error("Error saving user:", err);
      res.status(500).json({
        message: err.message || "Some error occurred while creating the user.",
      });
    });
};

// Retrieve and return all users from the database.
exports.findAll = (req, res) => {
  User.find()
    .then((users) => {
      res.send(users);
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message || "Some error occurred while retrieving users.",
      });
    });
};

// Find a single useer with a userName
exports.findOne = (req, res) => {
  const userId = req.params.id;
  //   console.log("userID = ", req.params);
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid user ObjectId" });
  }
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).send({
          message: "User not found with userId " + userId,
        });
      }
      res.status(200).json({ user: user });
      //console.log("user", user);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving user with the given ID.",
      });
    });
};
//find by email-> Login
exports.login = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //   console.log("email:", req.body.email);
  //   console.log("pass", password);

  //with  {}  the va obj that node need and look for it
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      // Compare the entered password with the hashed password
      //   const isPasswordValid = bcrypt.compare(password, user.password);

      //   if (!isPasswordValid) {
      //     return res.status(401).json({ message: "Invalid password" });
      //   }
      // Check if the entered password matches the user's password
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid password" });
      }

      // Successful login
      const userId = user._id;
      return res.status(200).json({ user, userId });
    })
    .catch((error) => {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Server error" });
    });
};
// get the list of people the user follows
exports.followingList = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).populate(
      "following",

      "userName"
    );

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    res.json(user.following);
  } catch (error) {
    res.status(500).json({ error: "Error fetching following list" });
  }
};
exports.followUser = async (req, res) => {
  try {
    // The ID of the user we want to follow
    //from frontenf have to be the same name
    const { followUserId } = req.body;

    // The ID of the currently logged-in user
    const loggedInUserId = req.params.loggedInUserId;

    const loggedInUser = await User.findById(loggedInUserId);
    const userToFollow = await User.findById(followUserId);

    if (!loggedInUser || !userToFollow) {
      return res.status(400).json({ error: "User not found" });
    }
    if (!loggedInUser.following) {
      loggedInUser.following = []; // Initialize the following array if it's undefined
    }
    // Check if the logged-in user is already following the user
    if (!loggedInUser.following.includes(followUserId)) {
      loggedInUser.following.push(followUserId);
    }
    // console.log("hi3");

    await loggedInUser.save();
    return res.status(200).json({ message: "User added to following list." });
    // res.json({ message: "User followed successfully" });
  } catch (error) {
    res.status(500).json(error.message);
  }
};
// Update a user identified by the email in the request
exports.update = (req, res) => {
  const userId = req.params.id;
  // Validate Request
  if (!req.body.email && !req.body.userName) {
    return res.status(400).send({
      message: "useName and email can not be empty",
    });
  }

  // Find user and update it with the request body
  User.findByemailAndUpdate(
    req.params.email,
    {
      userName: req.body.userName,
      bio: req.body.bio,
      img: req.body.img,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
    },
    { new: true }
  )
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "User not found with email " + req.params.email,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "User not found with email " + req.params.email,
        });
      }
      return res.status(500).send({
        message: "Error updating user with email " + req.params.email,
      });
    });
};

// Delete a user with the specified email in the request
exports.remove = (req, res) => {
  const userId = req.params.id;
  User.findByIdAndRemove(userId)
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: "User not found with userId " + userId,
        });
      }
      res.send({ message: "User deleted successfully!" });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "User not found with userId " + userId,
        });
      }
      return res.status(500).send({
        message: "Could not delete user with userId " + userId,
      });
    });
};
