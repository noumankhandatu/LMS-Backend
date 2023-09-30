const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Please enter your name"],
    },
    email: {
      type: String,
      require: [true, "Please enter your email"],
      unique: true,
    },
    password: {
      type: String,
      require: [true, "Please enter your password"],
      select: false,
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    courses: [
      {
        courseId: String,
      },
    ],
  },
  { timestamps: true }
);

//  Sign In Access Token
Schema.methods.SignAccessToken = () => {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || " ");
};
// Sign In Refresh Token

Schema.methods.SignRefreshToken = () => {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || " ");
};
const UserModel = mongoose.model("UserModel", Schema);
module.exports = UserModel;
