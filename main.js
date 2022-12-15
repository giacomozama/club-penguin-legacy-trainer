const { app, BrowserWindow } = require("electron");
const { syncHacksOnLocalServer } = require("./hacks");
const { setupIpcHandlers } = require("./ipc");

const { setupLocalServer } = require("./server");

setupIpcHandlers();

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 820,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("public/index.html");
};

app.whenReady().then(async () => {
  setupLocalServer();
  createWindow();

  await syncHacksOnLocalServer();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
