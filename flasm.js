const process = require("process");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { downloadFile } = require("./download");
const AdmZip = require("adm-zip");
const tar = require("tar-stream");
const gunzip = require("gunzip-maybe");

const flasmDir = "flasm";
const flasmExecutableName =
  process.platform === "win32" ? "flasm.exe" : "flasm";

exports.setupFlasm = async () => {
  console.log("Setting Flasm up... ");

  if (!fs.existsSync(flasmDir)) {
    fs.mkdirSync(flasmDir);
  } else if (!fs.lstatSync(flasmDir).isDirectory) {
    throw 'Non-directory file named "flasm" present';
  }

  const flasmExecutablePath = path.join(flasmDir, flasmExecutableName);

  if (
    fs.existsSync(flasmExecutablePath) &&
    fs.existsSync(path.join(flasmDir, "flasm.ini"))
  ) {
    console.log("SKIPPED");
    return;
  }

  let flasmArchiveName;
  switch (process.platform) {
    case "win32":
      flasmArchiveName = "flasm16win.zip";
      break;
    case "darwin":
      flasmArchiveName = "flasm16mac.tgz";
      break;
    default:
      flasmArchiveName = "flasm16linux.tgz";
      break;
  }

  const flasmArchivePath = path.join(flasmDir, flasmArchiveName);
  await downloadFile(
    path.join("http://www.nowrap.de/download", flasmArchiveName),
    flasmArchivePath
  );

  return new Promise((resolve, reject) => {
    if (flasmArchiveName.endsWith("zip")) {
      const zip = new AdmZip(flasmArchivePath);
      zip.extractEntryTo(flasmExecutableName, flasmDir);
      zip.extractEntryTo("flasm.ini", flasmDir);
      zip.extractEntryTo("LICENSE.TXT", flasmDir);
      fs.unlinkSync(flasmArchivePath);
      console.log("DONE");
      resolve();
    } else {
      const extract = tar
        .extract()
        .on("entry", (header, stream, next) => {
          if (
            header.name === flasmExecutableName ||
            header.name === "flasm.ini" ||
            header.name === "LICENSE.TXT"
          ) {
            stream.pipe(fs.createWriteStream(path.join(flasmDir, header.name)));
          } else {
            next();
          }
          stream.resume();
          stream.on("end", next);
        })
        .on("finish", () => {
          fs.chmodSync(flasmExecutablePath, "755");
          fs.unlinkSync(flasmArchivePath);
          console.log("DONE");
        });

      fs.createReadStream(flasmArchivePath).pipe(gunzip()).pipe(extract);
      resolve();
    }
  });
};

exports.disassemble = (swfFile) =>
  new Promise((resolve) => {
    exec(
      path.join(__dirname, flasmDir, flasmExecutableName) +
        " -d " +
        path.join(__dirname, swfFile),
      (_error, stdout, _stderr) => resolve(stdout)
    );
  });

exports.assemble = (flmFile) =>
  new Promise((resolve) => {
    exec(
      path.join(__dirname, flasmDir, flasmExecutableName) +
        " -a " +
        path.join(__dirname, flmFile),
      (_error, stdout, _stderr) => resolve(stdout)
    );
  });
