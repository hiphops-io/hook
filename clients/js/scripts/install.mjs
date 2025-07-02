#!/usr/bin/env node
import fs from "fs";
import path from "path";
import https from "https";
import os from "os";
import { createWriteStream, mkdirSync } from "fs";
// Get package version to download matching hook binary version
import packageJson from "../package.json" with {type: "json"};

const version = packageJson.version;

// Skip binary download if env var is set
if (process.env.HIPHOPS_HOOK_BIN) {
  console.log(
    `Using hook binary from HIPHOPS_HOOK_BIN: ${process.env.HIPHOPS_HOOK_BIN}`
  );
  process.exit(0);
}

// Skip during development
if (
  process.env.NODE_ENV === "development" ||
  process.env.SKIP_HOOK_DOWNLOAD === "true"
) {
  console.log("Skipping hook binary download in development mode");
  process.exit(0);
}

// Determine platform and architecture
const platform = os.platform();
const arch = os.arch();

// Determine the binary name based on platform and architecture
let binaryName;
if (platform === "win32") {
  binaryName = "hook-windows-amd64.exe";
} else if (platform === "darwin") {
  binaryName = `hook-darwin-${arch === "arm64" ? "arm64" : "amd64"}`;
} else if (platform === "linux") {
  binaryName = `hook-linux-${arch === "arm64" ? "arm64" : "amd64"}`;
} else {
  console.error(`Unsupported platform: ${platform}`);
  process.exit(1);
}

// Create bin directory if it doesn't exist
const fileDir = path.dirname(path.dirname(new URL("", import.meta.url).pathname));
const binDir = path.join(fileDir, "bin");
if (!fs.existsSync(binDir)) {
  mkdirSync(binDir, { recursive: true });
}

const binaryPath = path.join(binDir, binaryName);

// URL to download the binary
const downloadUrl = `https://github.com/hiphops-io/hook/releases/download/v${version}/${binaryName}`;

const get = (url, callback) => {
  const req = https.get(url, (response) => {
    // Handle redirects
    if (response.headers.location) {
      return get(response.headers.location, callback);
    } else {
      return callback(response);
    }
  });
  req.end();
  req.on("error", handleError);
};

const handleError = (err) => {
  console.error(`Error downloading binary: ${err.message}`);
  fs.unlinkSync(binaryPath);
  process.exit(1);
};

const makeExecutable = (filePath) => {
  try {
    // Make binary executable on Unix-like systems
    if (platform !== "win32") {
      fs.chmodSync(filePath, "755");
    }
  } catch (err) {
    console.error(`Failed to make binary executable: ${err.message}`);
    process.exit(1);
  }
};

// Download the binary
console.log(`Downloading hook binary from: ${downloadUrl}`);

const file = createWriteStream(binaryPath);

file.on("finish", () => {
  file.close();
  makeExecutable(binaryPath);
  console.log(`Successfully downloaded hook binary to ${binaryPath}`);
  process.exit(0);
});

file.on("error", (err) => {
  console.log("Error writing hook binary to disk:", err);
  process.exit(1);
});

get(downloadUrl, (response) => {
  if (response.statusCode === 200) {
    response.pipe(file);
    console.log("Done streaming to file");
    return
  } else {
    console.error(
      `Failed to download binary. Status code: ${response.statusCode}`
    );

    file.close();
    fs.unlinkSync(binaryPath);
    process.exit(1);
  }
});
