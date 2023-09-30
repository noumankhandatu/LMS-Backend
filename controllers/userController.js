const asyncHandler = require("express-async-handler");
const UserModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const ejs = require("ejs");
const path = require("path");
const sendMail = require("../utils/sendMail");
const bcrypt = require("bcrypt");

const RegisterUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
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

  // const html = await ejs.renderFile(path.join(__dirname, "../mails/activationMail.ejs"), data);
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

module.exports = { RegisterUser, CreateActivationToken, ActivateUser };
