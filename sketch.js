const p5 = require("node-p5");
const dyes = require("./dyes");
const bannerPatterns = require("./banner_patterns");
const axios = require("axios");

const BANNER_WIDTH = 20;
const BANNER_HEIGHT = 40;

const BIT = 8;

const BANNER_BIT_WIDTH = BANNER_WIDTH*BIT;
const BANNER_BIT_HEIGHT = BANNER_HEIGHT*BIT;

const CANVAS_SIZE = BANNER_WIDTH > BANNER_HEIGHT ? BANNER_BIT_WIDTH : BANNER_BIT_HEIGHT;

const X_OFFSET = (CANVAS_SIZE - BANNER_BIT_WIDTH)/2;
const Y_OFFSET = (CANVAS_SIZE - BANNER_BIT_HEIGHT)/2;

var layers;

// Create an axios instance.
const instance = axios.create({ baseURL: app.address });

// Send status text and twitter media id to be tweeted.
function status(statusText, mediaId) {
  instance.post("/status", {
    "statusText": statusText,
    "mediaId": mediaId,
  })
  .then(function (response) {
    if (response.data.statusCode == 200) {
      console.log(`SUCCESS ${response.data.statusCode}: ${response.data.tweetId}`);
    }
    else {
      console.error(`ERROR ${response.data.statusCode}: ${JSON.parse(response.data.body).errors[0].message}`);
    }
  })
  .catch(function (error) {
    console.log(error);
  });
}

// Send banner image to be uploaded for tweet.
p5.registerMethod("uploadMedia", function(blobDataUrl) {
  instance.post("/upload", {
    "blobDataUrl": blobDataUrl
  })
  .then(function (response) {
    let responseBody = JSON.parse(response.data.body);

    if (response.data.statusCode == 200) {
      status(layers, responseBody.media_id_string);
    }
    else {
      console.error(`ERROR ${response.data.statusCode}: ${responseBody.error}`);
    }
  })
  .catch(function (error) {
    console.log(error);
  });
});

function sketch(p) {
  p.setup = () => {
    let canvas = p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);

    p.colorMode(p.RGB, 255, 255, 255, 1);
    p.noStroke();

    let allDyes = Object.keys(dyes.all);

    // Banner background color.
    let bgColorName = p.random(allDyes);
    let bgColor = dyes.all[bgColorName];

    // Draw banner background.
    p.fill(bgColor.r, bgColor.g, bgColor.b)
    p.rect(X_OFFSET, Y_OFFSET, BANNER_BIT_WIDTH, BANNER_BIT_HEIGHT);

    // Log banner color.
    layers = `Base: ${bgColorName} Banner \n`;

    // Number of patterns to layer.
    let numOfPatterns = p.random([1, 2, 3, 4, 5, 6]);
    for (let i = 0; i < numOfPatterns; i++) {
      // Color of layer.
      let dyeName = p.random(allDyes);
      let dyeColor = dyes.all[dyeName];

      // Pattern of layer.
      let patternName = p.random(Object.keys(bannerPatterns.all));
      let pattern = bannerPatterns.all[patternName];

      // Log layer details.
      layers += `${i+1}: ${patternName} in ${dyeName}\n`;

      // Draw pattern.
      for (let y = 0; y < pattern.length; y++) {
        let row = pattern[y];

        for (let x = 0; x < row.length; x++) {
          p.fill(dyeColor.r, dyeColor.g, dyeColor.b, row[x]);
          p.square(x*BIT + X_OFFSET, y*BIT + Y_OFFSET, BIT);
        }
      }
    }

    // Convert canvas to blob base64 data.
    let blobDataUrl = canvas.elt.toDataURL().replace("data:image/png;base64,", "");
    p.uploadMedia(blobDataUrl);
  }
}

module.exports = {
  drawBanner: function() {
    p5.createSketch(sketch);
  },
}
