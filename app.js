const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { UserRouter } = require("./routes/userRoute");
const { CourseRoute } = require("./routes/courseRoute");
const { OrderRoute } = require("./routes/orderRoute");
const { NotificationRoute } = require("./routes/notificationRoute");
const { AnalyticRoute } = require("./routes/analyticRoute");
const LayoutRoute = require("./routes/layoutRoute");
// body parser
app.use(express.json());
// cookie parser for cookies

app.use(cookieParser());

// cors
app.use(
  cors({
    origin: process.env.ORIGIN,
  })
);

// routes
app.use(
  "/api/v1",
  UserRouter,
  CourseRoute,
  OrderRoute,
  NotificationRoute,
  AnalyticRoute,
  LayoutRoute
);

app.get("/test", (req, res) => {
  return res.status(200).send({ messasge: "Great api working" });
});

app.all("*", (req, res) => {
  return res.status(404).send({ messasge: req.originalUrl + "route not match" });
});

module.exports = { app };
