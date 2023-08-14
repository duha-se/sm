const express = require("express");
const connectDB = require("./DB/database");
const cors = require("cors");
const app = express();
const usersRoutes = require("./router/userRoute");
const postsRouters = require("./router/postRoute");
const bodyParser = require("body-parser");

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

app.use("/sm", usersRoutes);
app.use("/sm", postsRouters);
// Start the server
const port = 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
