const { ipcMain } = require("electron");
const { updateConfig, availableHacks, currentConfig } = require("./config");
const { syncHacksOnLocalServer } = require("./hacks");

exports.setupIpcHandlers = () => {
  ipcMain.on("change-config", (_, arg) => {
    updateConfig(arg);
    syncHacksOnLocalServer();
  });

  ipcMain.handle("get-hacks", () => {
    const result = [];
    for (key in availableHacks) {
      const hack = availableHacks[key];
      result.push({
        id: hack.id,
        title: hack.title,
        description: hack.description,
        enabled: currentConfig[key],
      });
    }
    return result;
  });
};
