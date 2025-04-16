const https = require("https");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execSync } = require("child_process");

const platform = os.platform();
const arch = os.arch();

const download = (url, dest) => new Promise((resolve, reject) => {
  const file = fs.createWriteStream(dest);
  https.get(url, res => {
    if (res.statusCode !== 200) {
      reject(new Error(`Request failed: ${res.statusCode}`));
      return;
    }

    res.pipe(file);
    file.on("finish", () => {
      file.close(resolve);
    });
  }).on("error", err => {
    fs.unlink(dest, () => reject(err));
  });
});

const getFFmpegURL = () => {
  // Adjust based on your needs (can point to other sources like gyan.dev or johnvansickle.com)
  const base = "https://ffbinaries.com/api/v1/version/latest";
  return new Promise((resolve, reject) => {
    https.get(base, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        const info = JSON.parse(data);
        let target;

        if (platform === "win32") {
          target = arch === "x64" ? "windows-64" : "windows-32";
        } else if (platform === "darwin") {
          target = arch === "arm64" ? "osx-arm64" : "osx-64";
        } else if (platform === "linux") {
          target = arch === "x64" ? "linux-64" : "linux-32";
        } else {
          reject("Unsupported platform/architecture.");
          return;
        }

        const url = info.bin[target].ffmpeg;
        resolve(url);
      });
    }).on("error", reject);
  });
};

(async () => {
  try {
    const url = await getFFmpegURL();
    const fileName = path.basename(url);
    const destPath = path.join(__dirname, fileName);

    console.log(`Detected platform: ${platform}, arch: ${arch}`);
    console.log(`Downloading ffmpeg from: ${url}`);

    await download(url, destPath);

    if (fileName.endsWith(".zip")) {
      const extract = require("extract-zip");
      await extract(destPath, { dir: __dirname });
      fs.unlinkSync(destPath);
      console.log("Extracted ffmpeg binary.");
    } else {
      fs.chmodSync(destPath, 0o755);
      console.log(`Saved ffmpeg binary to: ${destPath}`);
    }

  } catch (err) {
    console.error("Failed:", err);
  }
})();
