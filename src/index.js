const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const ytdl = require("ytdl-core");
const page = "https://v0ddf.sse.codesandbox.io/";
const getSubtitles = require("youtube-captions-scraper").getSubtitles;
const tester = {};
const cors = require("cors");

app.use(
  cors({
    origin: function (origin, callback) {
      return callback(null, true);
    }
  })
);
app.use(express.static("public"));
function getInfo(url) {
  console.log(url);
  if (!url || !ytdl.validateURL(url)) return res.redirect(page);
  console.log("VALID URL");
  return ytdl.getInfo(url);
}

app.get("/info", async (req, res) => {
  console.log("info");
  getInfo(req.query.url)
    .then((info) => {
      res.json(info);
    })
    .catch((e) => {
      console.log(e);
      res.redirect(page);
    });
});
app.get("/download", async (req, res) => {
  getInfo(req.query.url)
    .then((info) => {
      res.header(
        "Content-Disposition",
        `attachment; filename="${info.videoDetails.title}.mp4"`
      );

      ytdl(req.query.url, {
        format: "mp4",
        filter: "audioandvideo",
        quality: "lowestvideo"
      }).pipe(res);
    })
    .catch((e) => {
      console.log(e);
      res.redirect(page);
    });
});
app.get("/captions", async (req, res) => {
  console.log("captions");
  var info = await getInfo(req.query.url);
  if (!info) return res.end();
  getSubtitles({
    videoID: info.videoDetails.videoId, // youtube video id
    lang: "en" // default: `en`
  })
    .then((captions) => {
      res.json(captions);
    })
    .catch((e) => {
      res.end(e.message);
    });
});

app.get("/view", async (req, res) => {
  console.log("view video");
  var { url, quality } = req.query;
  console.log(url);
  if (!url || !ytdl.validateURL(url)) return res.redirect(page);
  console.log("VALID URL");
  if (tester[url + quality]) return res.redirect(tester[url + quality]);
  getInfo(url)
    .then((info) => {
      console.log("Got info");
      var formats = info.formats.filter(
        (format) => format.hasVideo && format.hasAudio
      );

      if (!formats.length) return res.redirect(page);
      var video =
        quality === "lowest" ? formats[0] : formats[formats.length - 1];
      console.log(info.videoDetails.title, video.qualityLabel);
      tester[url + quality] = video.url;
      res.redirect(video.url);
    })
    .catch((e) => {
      console.log("error getting info");
      tester[url + quality] = page;
      res.redirect(404, page);
    });
});

server.listen(8080, () => {
  console.log("listening on *:" + 8080);
});
console.log("bum bum bum bum");
