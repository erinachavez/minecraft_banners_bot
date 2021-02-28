const express = require("express");
const twitterAPI = require("node-twitter-api");
const cron = require("node-cron");
const bodyParser = require("body-parser");
const sketch = require("./sketch");

// Setup server.
const app = express();
const server = app.listen(process.env.PORT || 3000, function() {
  console.log(`Minecraft Banners Bot listening at http://${server.address().address}:${server.address().port}`);
});

// Require body parser to read api request body.
app.use(bodyParser.json())

// Set twitter app credentials.
const twitter = new twitterAPI({
  consumerKey: process.env.CONSUMER_KEY,
  consumerSecret: process.env.CONSUMER_SECRET
});

// Upload media to twitter.
app.post("/upload", (req, res) => {
  twitter.uploadMedia(
    {
      "media": req.body.blobDataUrl,
      "isBase64": true,
    },
    process.env.ACCESS_TOKEN,
    process.env.ACCESS_TOKEN_SECRET,
    function (error, data, response) {
      let responseBody = JSON.parse(response.body);

      if (response.statusCode == 200) {
        console.log(`UPLOAD SUCCESS ${response.statusCode}: ${responseBody.media_id_string}`);
      }
      else {
        console.error(`UPLOAD ERROR ${response.statusCode}: ${responseBody.errors[0].message}`);
      }

      res.send(response);
    }
  );
});

// Post status to twitter.
app.post("/status", (req, res) => {
  twitter.statuses(
    "update",
    {
      "status": req.body.statusText,
      "media_ids": req.body.mediaId,
    },
    process.env.ACCESS_TOKEN,
    process.env.ACCESS_TOKEN_SECRET,
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

// Every 5 minutes log message.
cron.schedule("*/5 * * * *", () => {
  var dateTimeNow = new Date(Date.now());
  console.log(`running... ${dateTimeNow.toISOString()}.`);
}, { timezone: process.env.TZ });

// Draw a banner at 3, 9, 15, 21 o'clock EST.
cron.schedule("0 3,9,15,21 * * *", () => {
  var dateTimeNow = new Date(Date.now());
  console.log(`\nBanner drawing started at ${dateTimeNow.toISOString()}.`);
  sketch.drawBanner();
}, { timezone: process.env.TZ });
