const asyncHandler = require("express-async-handler");
const UserModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const bcrypt = require("bcrypt");
const { sendToken, accessTokenOptions, refreshTokenOptions } = require("../utils/jwt");
const { getUserById } = require("../services/userServices");
const cloudinary = require("cloudinary");
// Register the user
const RegisterUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !password || !email) {
    return res.status(401).send({ message: "Please enter name password and email address" });
  }
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isEmailValid) {
    return res.status(400).send({ message: "Invalid email format" });
  }

  const isEmailExist = await UserModel.findOne({ email: email });

  if (isEmailExist) {
    return res.status(403).send({ message: "User already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { name, email, password: hashedPassword };
  const activationToken = await CreateActivationToken(user);

  // we got activation code here
  const activationCode = activationToken.activationCode;

  // now we sending activation code to email
  const data = { user: user, activationCode };

  try {
    await sendMail({
      email: user.email,
      subject: "Activate your account",
      template: "activationMail.ejs", //email filename
      data,
    });

    res.status(201).send({
      message: "Please check your mail " + user.email + " to activae your account",
      activationToken: activationToken.token,
    });
  } catch (error) {
    return res.status(500).send({ message: error });
  }
});

// creating activation token and jwt
const CreateActivationToken = asyncHandler((user) => {
  // activation code
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  // jwt token
  const token = jwt.sign({ user, activationCode }, process.env.ACTIVATION_SECRET_KEY, {
    expiresIn: "5m",
  });
  return { token, activationCode };
});

// activating user
const ActivateUser = asyncHandler(async (req, res, next) => {
  try {
    const { activationCode, activationToken } = req.body;
    const newUser = jwt.verify(activationToken, process.env.ACTIVATION_SECRET_KEY);
    if (newUser.activationCode !== activationCode) {
      return res.status(403).send({
        message: "Invalid activation code",
      });
    }
    const { name, email, password } = newUser.user;
    const existUser = await UserModel.findOne({ email });
    if (existUser) {
      return res.status(400).send({
        message: "User already exists",
      });
    }
    const user = await UserModel.create({ name, email, password });
    res.status(201).send({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    return res.status(500).send({ message: error });
  }
});

// Login User
const LoginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({ message: "Please provide email and password" });
    }
    // check email
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).send({ message: "Invalid email or password" });
    }
    // check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).send({ message: "Invalid email or password" });
    }
    sendToken(user, 200, res);
  } catch (error) {
    return res.status(500).send({ message: error, error: "Login api error" });
  }
});

// Logout user
const LogoutUser = asyncHandler((req, res) => {
  try {
    res.cookie("accessToken", "", { maxAge: 1 });
    res.cookie("refreshToken", "", { maxAge: 1 });
    return res.status(200).send({
      message: "Successfully logged out",
    });
  } catch (error) {
    return res.status(500).send({ message: error });
  }
});

// update accesstoken
const UpdateAccessToken = asyncHandler(async (req, res) => {
  try {
    const refresh_token = req.cookies.refreshToken;
    const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN);

    const message = "Could not refresh token";
    if (!decoded) {
      return res.status(400).send({ message });
    }
    // user session means user data
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(400).send({ message });
    }
    const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN, { expiresIn: "5m" });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN, {
      expiresIn: "3d",
    });
    // req.user needs to be saved to use req?.user?._id; to find current user
    req.user = user;
    res.cookie("accessToken", accessToken, accessTokenOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenOptions);

    return res.status(200).send({
      message: "Successfully updated access token" + accessToken,
    });
  } catch (error) {
    return res.status(500).send({ message: error });
  }
});

// get user info
const UserInfo = asyncHandler((req, res, next) => {
  try {
    const userId = req?.user?._id;
    getUserById(userId, res);
  } catch (error) {
    return res.status(500).send({ message: error });
  }
});

// social auth
const socialAuth = asyncHandler(async (req, res, next) => {
  try {
    const { email, name, avatar } = req.body;
    if (!email || !name || !avatar) {
      return res.status(403).send({ message: "enter email , name ,avatar" });
    }
    const user = await UserModel.findOne({ email });
    // if user is not found creating one or else using default user
    if (!user) {
      const newUser = await UserModel.create({ email, name, avatar });
      // send token stores cookies accestoken and refreshtoken
      sendToken(newUser, 200, res);
    } else {
      sendToken(user, 200, res);
    }
  } catch (error) {
    return res.status(500).send({ message: error });
  }
});

// update user info (name and password and avatar)
const updateUserInfo = asyncHandler(async (req, res) => {
  try {
    const { email, name } = req.body;
    // we are getting current login user from here req.user._id  its working cos of cookies
    const userId = req?.user?._id;

    const user = await UserModel.findById(userId);

    if (!userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email && user) {
      const isEmailExist = await UserModel.findOne({ email });
      if (isEmailExist) {
        return res.status(403).json({ message: "Email already exists, choose another email" });
      }
      user.email = email;
    }

    if (name && user) {
      user.name = name;
    }

    await user.save();

    return res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

// update user password
const updateUserPassword = asyncHandler(async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Check if oldPassword and newPassword are provided
    if (!oldPassword || !newPassword) {
      return res.status(400).send({ message: "Please provide both old and new passwords" });
    }
    const userId = req?.user?._id;

    const user = await UserModel.findById(userId).select("+password");
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    // Verify if the old password matches the stored hashed password
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!passwordMatch) {
      return res.status(400).send({ message: "Old password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPassword;
    await user.save();

    res.status(200).send({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

// update profile picture

const updateProfilePicture = asyncHandler(async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar) {
      return res.status(400).send({ message: "Enter avatar" });
    }
    const user = req.user;
    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }
    if (user?.avatar?.public_id) {
      // first delete the avatar
      await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);
      // then update the avatar
      await cloudinary.v2.uploader.upload(avatar, { folder: "avatars", width: "150px" });
    } else {
      // direct upload if avatar not available
      await cloudinary.v2.uploader.upload(avatar, { folder: "avatars", width: "150px" });
    }

    user.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };

    await user.save();
    res.status(200).send({ message: "Profile picture updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = {
  RegisterUser,
  CreateActivationToken,
  ActivateUser,
  LoginUser,
  LogoutUser,
  UpdateAccessToken,
  UserInfo,
  socialAuth,
  updateUserInfo,
  updateUserPassword,
  updateProfilePicture,
};
