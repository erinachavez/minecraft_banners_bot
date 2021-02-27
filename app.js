const express = require("express");
const twitterAPI = require("node-twitter-api");
const cron = require("node-cron");
const sketch = require("./sketch");

const app = express();
const server = app.listen(process.env.PORT || 3000, listen);

const host = server.address().address;
const port = server.address().port;
const address = `http://${host}:${port}`;

function listen() {
  console.log(`Minecraft Banners Bot listening at http://${host}:${port}`);
}


var twitter = new twitterAPI({
  consumerKey: process.env.CONSUMER_KEY,
  consumerSecret: process.env.CONSUMER_SECRET
});

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


cron.schedule("*/5 * * * *", () => {
  var dateTimeNow = new Date(Date.now());
  console.log(`running... ${dateTimeNow.toISOString()}.`);
}, { timezone: process.env.TZ });

cron.schedule("10 4,10,16,22 * * *", () => {
  var dateTimeNow = new Date(Date.now());
  console.log(`\nBanner drawing started at ${dateTimeNow.toISOString()}.`);
  sketch.drawBanner();
}, { timezone: process.env.TZ });


module.exports = {
  address: address
};
