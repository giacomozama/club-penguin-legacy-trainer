const fs = require("fs");

const config = require("./config.json");
exports.currentConfig = config;

exports.updateConfig = (newConfig) => {
  for (key in newConfig) config[key] = newConfig[key];
  fs.writeFile("config.json", JSON.stringify(config), () => {});
};

exports.availableHacks = require("./hacks.json");