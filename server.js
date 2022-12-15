const { session } = require("electron");
const path = require("path");
const http = require("http");

const { CDN_URL } = require("./consts");
const { availableHacks } = require("./config");

const setupRequestListener = () => {
  const hacksByUrl = {};
  for (const key in availableHacks) {
    const hack = availableHacks[key];
    hacksByUrl[hack.url] = hack;
  }
  
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const hack = hacksByUrl[details.url];
    if (!hack || !config[hack.id]) {
      callback({});
      return;
    }
    callback({
      redirectURL: details.url.replace(CDN_URL, "http://127.0.0.1:8420"),
    });
  });
};

exports.setupLocalServer = () => {
  http
    .createServer((req, res) => {
      fs.readFile(
        path.join(__dirname, "server", req.url),
        "binary",
        (_, file) => {
          res.setHeader("Content-Type", "application/x-shockwave-flash");
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.writeHead(200);
          res.write(file, "binary");
          res.end();
        }
      );
    })
    .listen(8420, "127.0.0.1", () => {
      console.log("Local server started.");
    });
  setupRequestListener();
};
