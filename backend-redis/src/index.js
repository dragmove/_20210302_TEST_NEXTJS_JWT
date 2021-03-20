const express = require("express");
const redis = require("redis");

const client = redis.createClient({
  host: "redis-server",
  port: 6379,
});
client.on("connect", () => {
  console.log("redis-server is connected");
});
client.on("error", (err) => {
  console.error(err);
});

const app = express();
app.get("/refresh-token/:id", (req, res) => {
  const memberId = req.data?.id;
  console.log("get. memberId :", memberId);

  if (!memberId) {
    res.statusCode(400);
    return;
  }

  client.get(`refresh_token_${memberId}`, (err, value) => {
    if (err) {
      console.error(err);
      res.statusCode(500);
      return;
    }

    res.status(200).send({
      memberId,
      refreshToken: value,
    });
  });
});

app.post("/refresh-token/:id", (req, res) => {
  const data = req.data;
  console.log("post data :", data);

  const { memberId, refreshToken } = data;
  if (!memberId || !refreshToken) {
    res.statusCode(400);
    return;
  }

  client.set(`refresh_otken_${memberId}`, refreshToken);
});

app.listen(8080, () => {
  console.log("Listening on port 8080");
});
