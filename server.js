require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const { connectToDatabase } = require("./utils/mongodb");
const { app } = require("./app");

// cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  connectToDatabase();
});
