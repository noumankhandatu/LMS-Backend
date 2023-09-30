require("dotenv").config();
const { connectToDatabase } = require("./utils/mongodb");
const { app } = require("./app");

app.listen(process.env.PORT, () => {
  console.log("Server is running on port " + process.env.PORT);
  // database connection mongo
  connectToDatabase();
});
