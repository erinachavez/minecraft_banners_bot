const express = require("express");
const twitterAPI = require("node-twitter-api");
const cron = require("node-cron");
const config = require("./config");
const sketch = require("./sketch");

const app = express();
const port = 3000;

var twitter = new twitterAPI({
  consumerKey: config.consumer_key,
  consumerSecret: config.consumer_secret
});

app.post("/upload", (req, res) => {
  twitter.uploadMedia(
    {
      "media": req.body.blobDataUrl,
      "isBase64": true,
    },
    config.access_token,
    config.access_token_secret,
    function (error, data, response) {
      let responseBody = JSON.parse(response.body);

      if (response.statusCode == 200) {
        console.log(`UPLOAD SUCCESS ${response.statusCode}: ${responseBody.media_id_string}`);
      }
      else {
        console.error(`UPLOAD ERROR ${response.statusCode}: ${responseBody.error}`);
      }

      res.send(response);
    }
  );
});

app.post("/status", (req, res) => {
  twitter.statuses(
    "update",
    {
      "status": req.body.statusText,
      "media_ids": req.body.mediaId,
    },
    config.access_token,
    config.access_token_secret,
    function (error, data, response) {
      if (error) {
        console.error(`TWEET ERROR ${error.statusCode}: ${JSON.parse(error.data).errors[0].message}`);
        res.send(error);
      }
      else {
        console.log(`TWEET SUCCESS ${response.statusCode}: ${data.id}`);
        res.send({
          "statusCode": response.statusCode,
          "tweetId": data.id,
        });
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Minecraft Banners Bot listening at http://localhost:${port}`);
});


cron.schedule("* 3,9,15,21 * * *", () => {
  var dateTimeNow = new Date(Date.now());
  console.log(`\nBanner drawing started at ${dateTimeNow.toISOString()}.`);
  sketch.drawBanner();
});
