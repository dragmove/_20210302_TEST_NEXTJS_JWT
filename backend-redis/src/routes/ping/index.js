const express = require("express");

const pingRouter = express.Router();

pingRouter.get("/ping", (req, res, next) => {
  console.log("/ping called");

  res.status(200).json({
    message: "ok. backend-redis",
  });
});

module.exports = pingRouter;
