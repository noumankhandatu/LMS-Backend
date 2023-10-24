const express = require("express");
const { isAuthenticated, authorizationRole } = require("../middleware/auth");
const { createLayout, editLayout, getLayoutByType } = require("../controllers/layoutController");
const LayoutRoute = express.Router();

LayoutRoute.post("/create-layout", isAuthenticated, authorizationRole("admin"), createLayout);

LayoutRoute.put("/update-layout", isAuthenticated, authorizationRole("admin"), editLayout);

LayoutRoute.get("/get-layout", getLayoutByType);

module.exports = LayoutRoute;
