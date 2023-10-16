const express = require("express");
const {
  RegisterUser,
  ActivateUser,
  LoginUser,
  LogoutUser,
  UpdateAccessToken,
  UserInfo,
  socialAuth,
  updateUserInfo,
  updateUserPassword,
  updateProfilePicture,
} = require("../controllers/userController");
const { isAuthenticated } = require("../middleware/auth");

const UserRouter = express.Router();

UserRouter.post("/register", RegisterUser);

UserRouter.post("/activate-user", ActivateUser);

UserRouter.post("/login", LoginUser);

UserRouter.get("/logout", isAuthenticated, LogoutUser);

UserRouter.get("/refresh-token", UpdateAccessToken);

UserRouter.get("/me", isAuthenticated, UserInfo);

UserRouter.post("/social-auth", socialAuth);

UserRouter.put("/update-user-info", isAuthenticated, updateUserInfo);

UserRouter.put("/update-user-password", isAuthenticated, updateUserPassword);

UserRouter.put("/update-user-avatar", isAuthenticated, updateProfilePicture);

module.exports = { UserRouter };
