const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

console.log("[backend-redis] process.env.NODE_ENV :", process.env.NODE_ENV);

const PORT = parseInt(process.env.PORT, 10) || 9000;

const redis = require("redis");

const redisClient = redis.createClient({
  host: "redis-server",
  port: 6379,
});
redisClient.on("connect", () => {
  console.log("redis-server is connected");
});
redisClient.on("error", (err) => {
  console.error(err);
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get("/ping", (req, res) => {
  res.status(200).send("hello backend-redis");
});

app.get("/refresh-token/:id", (req, res) => {
  const memberId = req.params?.id;
  console.log("get. /refresh-token/:id. memberId :", memberId);

  if (!memberId) {
    res.status(400).end();
    return;
  }

  redisClient.get(`refresh_token_${memberId}`, (err, value) => {
    if (err) {
      console.error(err);
      res.status(500).end();
      return;
    }

    res.status(200).send({
      memberId,
      refreshToken: value,
    });
  });
});

app.post("/refresh-token", (req, res) => {
  const data = req.body;
  console.log("post. /refresh-token. data :", data);

  const { memberId, refreshToken } = data;
  if (!memberId || !refreshToken) {
    res.status(400).end();
    return;
  }

  redisClient.set(`refresh_token_${memberId}`, refreshToken, redis.print);

  res.status(200).end();
});

app.listen(PORT, () => {
  console.log(`[backend-redis] Listening on port ${PORT}`);
});
