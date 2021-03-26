const express = require("express");
const bodyParser = require('body-parser');

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
app.use(bodyParser.json())

app.get("/refresh-token/:id", (req, res) => {
  const memberId = req.params?.id;
  console.log("get. /refresh-token/:id. memberId :", memberId);

  if (!memberId) {
    res.status(400).end();
    return;
  }

  client.get(`refresh_token_${memberId}`, (err, value) => {
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

  client.set(`refresh_otken_${memberId}`, refreshToken, redis.print);

  res.status(200).end();
});

app.listen(8080, () => {
  console.log("Listening on port 8080");
});
