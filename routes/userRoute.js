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
  updateUserRole,
  deleteUserRole,
} = require("../controllers/userController");
const { isAuthenticated, authorizationRole } = require("../middleware/auth");
const { getAllCoursesForAdmin } = require("../controllers/courseController");

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

UserRouter.get(
  "/get-all-users-admin",
  isAuthenticated,
  authorizationRole("admin"),
  getAllCoursesForAdmin
);

UserRouter.put(
  "/update-user-role-admin",
  isAuthenticated,
  authorizationRole("admin"),
  updateUserRole
);
UserRouter.delete(
  "/delete-user-admin/:id",
  isAuthenticated,
  authorizationRole("admin"),
  deleteUserRole
);

module.exports = { UserRouter };
