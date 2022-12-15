const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const { downloadFile } = require("./download");
const { disassemble, assemble, setupFlasm } = require("./flasm");
const { availableHacks, currentConfig } = require("./config");

const deployHack = async (hack) => {
  console.log("Deploying " + hack.title + "...");

  const serverFilePath = path.join("server", new URL(hack.url).pathname);

  if (fs.existsSync(serverFilePath)) {
    console.log("SKIPPED");
    return;
  }

  const tmpDir = crypto.randomUUID();
  fs.mkdirSync(tmpDir);

  const swfFileName = /[^/]*$/.exec(hack.url)[0];
  const swfFilePath = path.join(tmpDir, swfFileName);
  fs.mkdirSync(serverFilePath.slice(0, -swfFileName.length), {
    recursive: true,
  });

  await downloadFile(hack.url, swfFilePath);

  const flmFile = swfFilePath.slice(0, -4) + ".flm";
  const lines = (await disassemble(swfFilePath)).split(/\r?\n/);
  let lineNumber = 1;
  for (let i = 0; i < hack.substitutions.length; i++) {
    const { replaceLines, withLines } = hack.substitutions[i];
    while (lineNumber < replaceLines[0]) {
      fs.appendFileSync(flmFile, lines[lineNumber++ - 1] + "\n");
    }
    for (let j = 0; j < withLines.length; j++) {
      fs.appendFileSync(flmFile, withLines[j] + "\n");
    }
    lineNumber = replaceLines[1] + 1;
  }
  while (lineNumber <= lines.length) {
    fs.appendFileSync(flmFile, lines[lineNumber++ - 1] + "\n");
  }

  await assemble(flmFile);

  fs.copyFileSync(swfFilePath, serverFilePath);
  fs.rmSync(tmpDir, { recursive: true, force: true });

  console.log("DONE.");
};

const undeployHack = (hack) => {
  console.log("Undeploying " + hack.title + "...");

  const serverFilePath = path.join("server", new URL(hack.url).pathname);

  if (!fs.existsSync(serverFilePath)) {
    console.log("SKIPPED");
    return;
  }

  fs.unlinkSync(serverFilePath);

  console.log("DONE");
};

exports.syncHacksOnLocalServer = async () => {
  await setupFlasm();
  for (const key in availableHacks) {
    const hack = availableHacks[key];
    if (currentConfig[key]) {
      deployHack(hack);
    } else {
      undeployHack(hack);
    }
  }
};
