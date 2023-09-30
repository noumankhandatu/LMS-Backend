const express = require("express");
const { RegisterUser, ActivateUser } = require("../controllers/userController");
const UserRouter = express.Router();

UserRouter.post("/register", RegisterUser);
UserRouter.post("/activate-user", ActivateUser);

module.exports = { UserRouter };
