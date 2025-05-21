#!/usconst url = require('url');
const { execSync } = require("child_process");
const { createWriteStream, mkdirSync } = require("fs");

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
node;

const fs = require("fs");
const path = require("path");
const https = require("https");
const os = require("os");
const { execSync } = require("child_process");
const { createWriteStream, mkdirSync } = require("fs");

// Skip binary download if env var is set
if (process.env.HIPHOPS_HOOK_BIN) {
  console.log(
    `Using hook binary from HIPHOPS_HOOK_BIN: ${process.env.HIPHOPS_HOOK_BIN}`
  );
  process.exit(0);
}

// Determine platform and architecture
const platform = os.platform();
const arch = os.arch();

// Get package version to download matching hook binary version
const packageJson = require("../package.json");
const version = packageJson.version;

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
const binDir = path.join(__dirname, "..", "bin");
if (!fs.existsSync(binDir)) {
  mkdirSync(binDir, { recursive: true });
}

const binaryPath = path.join(binDir, binaryName);

// URL to download the binary
const downloadUrl = `https://github.com/hiphops-io/hook/releases/download/v${version}/${binaryName}`;

console.log(`Downloading hook binary from: ${downloadUrl}`);

// Download the binary
const file = createWriteStream(binaryPath);
https
  .get(downloadUrl, (response) => {
    if (response.statusCode === 302 || response.statusCode === 301) {
      // Handle redirects
      https
        .get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);

          file.on("finish", () => {
            file.close();
            makeExecutable(binaryPath);
            console.log(`Successfully downloaded hook binary to ${binaryPath}`);
          });
        })
        .on("error", handleError);
    } else if (response.statusCode === 200) {
      response.pipe(file);

      file.on("finish", () => {
        file.close();
        makeExecutable(binaryPath);
        console.log(`Successfully downloaded hook binary to ${binaryPath}`);
      });
    } else {
      console.error(
        `Failed to download binary. Status code: ${response.statusCode}`
      );
      if (response.statusCode === 404) {
        console.error(
          "Binary not found. This may be because the version in package.json does not match a GitHub release."
        );
      }
      file.close();
      fs.unlinkSync(binaryPath);
      process.exit(1);
    }
  })
  .on("error", handleError);

function handleError(err) {
  console.error(`Error downloading binary: ${err.message}`);
  fs.unlinkSync(binaryPath);
  process.exit(1);
}

function makeExecutable(filePath) {
  try {
    // Make binary executable on Unix-like systems
    if (platform !== "win32") {
      fs.chmodSync(filePath, "755");
    }
  } catch (err) {
    console.error(`Failed to make binary executable: ${err.message}`);
    process.exit(1);
  }
}
