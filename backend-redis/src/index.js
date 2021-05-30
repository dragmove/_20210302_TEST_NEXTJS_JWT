const chalk = require("chalk");
const express = require("express");
const cors = require("cors");
const pingRouter = require("./routes/ping");
const { log } = require("./utils/common");

log("[backend-redis] process.env.NODE_ENV :", process.env.NODE_ENV);

const PORT = parseInt(process.env.PORT, 10) || 9000;

const redis = require("redis");

const redisClient = redis.createClient({
  host: "redis-server",
  port: 6379,
});
redisClient.on("connect", () => {
  console.log("[backend-redis] redis-server is connected");
});
redisClient.on("error", (err) => {
  console.error(err);
  console.log("[backend-redis] error 발생");
});

const app = express();
app.disable("x-powered-by");
app.use(express.json());
app.use(cors());
app.use(pingRouter);

// save refresh token
app.post("/refresh-token", (req, res) => {
  const data = req.body;
  log(chalk.bgWhite(`[backend-redis] post /refresh-token. data :`, data));

  const { memberId, refreshToken } = data;
  if (!memberId || !refreshToken) {
    log(chalk.bgWhite(`[backend-redis] Could not save refresh token`));
    return res.status(400).send();
  }

  redisClient.set(`refresh_token_${memberId}`, refreshToken, redis.print);

  res.status(200).json({
    message: "ok",
  });
});

app.get("/refresh-token/:id", (req, res) => {
  const memberId = req.params?.id;
  console.log("[backend-redis] get /refresh-token/:id. memberId :", memberId);

  if (!memberId) {
    return res.status(400).send();
  }

  redisClient.get(`refresh_token_${memberId}`, (err, value) => {
    if (err) {
      console.error(err);
      return res.status(500).send();
    }

    res.status(200).json({
      memberId,
      refreshToken: value,
    });
  });
});

app.delete("/refresh-token/:id", (req, res) => {
  const memberId = req.params?.id;
  console.log(
    "[backend-redis] delete /refresh-token/:id. memberId :",
    memberId
  );

  if (!memberId) {
    log(chalk.bgWhite(`[backend-redis] Could not delete refresh token`));
    return res.status(400).send();
  }

  redisClient.del(`refresh_token_${memberId}`, (err, response) => {
    if (err) {
      console.error(err);
      return res.status(500).send();
    }

    res.status(200).send();
  });
});

app.listen(PORT, () => {
  log(chalk.bgWhite(`[backend-redis] Listening on port: ${PORT}`));
});
