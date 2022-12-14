const { app, BrowserWindow, protocol, session } = require("electron");
const path = require("path");
const http = require("http");
const ipcMain = require("electron").ipcMain;
const fs = require("fs");
const hacks = require("./hacks.json");
const config = require("./config.json");
const { setupFlasm } = require("./flasm");
const { deployHack, undeployHack } = require("./hacks");

const hacksByUrl = {};
for (const key in hacks) {
  const hack = hacks[key];
  hacksByUrl[hack.url] = hack;
}

ipcMain.on("change-config", (_, arg) => {
  for (key in arg) config[key] = arg[key];
  fs.writeFile("config.json", JSON.stringify(config), () => {});
  loadHacks();
});

ipcMain.handle("get-hacks", () => {
  const result = [];
  for (key in hacks) {
    const hack = hacks[key];
    result.push({
      id: hack.id,
      title: hack.title,
      description: hack.description,
      enabled: config[key],
    });
  }
  return result;
});

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  });

  mainWindow.loadFile("public/index.html");
};

const setupRequestHooks = () => {
  loadHacks();

  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const hack = hacksByUrl[details.url];
    if (!hack || !config[hack.id]) {
      callback({});
      return;
    }
    callback({
      redirectURL: details.url.replace(
        "https://cpl-prod.b-cdn.net",
        "http://127.0.0.1:8420"
      ),
    });
  });
};

const loadHacks = () => {
  (async () => {
    await setupFlasm();
    for (const key in hacks) {
      const hack = hacks[key];
      if (config[key]) {
        deployHack(hack);
      } else {
        undeployHack(hack);
      }
    }
  })();
};

app.whenReady().then(async () => {
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
  setupRequestHooks();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
