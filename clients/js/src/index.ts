import { spawn, ChildProcess } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as http from "http";
import { URL } from "url";

// Constants
const SOCKET_PATH = "/tmp/hiphops.sock";
const BINARY_ENV_VAR = "HIPHOPS_HOOK_BIN";

// Interface for license information
export interface LicenseInfo {
  valid: boolean;
  expires_at: string | null;
  [key: string]: any;
}

// Get the directory of the current module
const getModuleDir = () => {
  try {
    // For ESM
    if (typeof import.meta !== "undefined" && import.meta.url) {
      const __filename = new URL("", import.meta.url).pathname;
      return path.dirname(path.dirname(__filename));
    }
  } catch (error) {
    // Ignore errors
  }

  // For CommonJS
  if (typeof __dirname !== "undefined") {
    return path.dirname(__dirname);
  }

  // Fallback
  return path.resolve(".");
};

// Helper to determine the binary path
const getBinaryPath = (): string => {
  // Check if env var is set
  const envBinaryPath = process.env[BINARY_ENV_VAR];
  if (envBinaryPath) {
    if (!fs.existsSync(envBinaryPath)) {
      throw new Error(
        `Binary path set in ${BINARY_ENV_VAR} does not exist: ${envBinaryPath}`
      );
    }
    return envBinaryPath;
  }

  // Determine platform and architecture
  const platform = os.platform();
  const arch = os.arch();

  let binaryName = "hook";

  if (platform === "win32") {
    binaryName = "hook-windows-amd64.exe";
  } else if (platform === "darwin") {
    binaryName = `hook-darwin-${arch === "arm64" ? "arm64" : "amd64"}`;
  } else if (platform === "linux") {
    binaryName = `hook-linux-${arch === "arm64" ? "arm64" : "amd64"}`;
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  const binaryPath = path.join(getModuleDir(), "bin", binaryName);

  if (!fs.existsSync(binaryPath)) {
    throw new Error(`Hook binary not found at: ${binaryPath}`);
  }

  return binaryPath;
};

class HookClient {
  private process: ChildProcess | null = null;
  private connectionPromise: Promise<void> | null = null;

  constructor() {
    this.ensureServerRunning();

    // If the parent process exits, kill the hook process
    process.on("exit", () => {
      this.process?.kill();
    });
  }

  private ensureServerRunning(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        // Check if the socket already exists (another process might have started the server)
        const socketExists = fs.existsSync(SOCKET_PATH);

        if (socketExists) {
          console.log("[Hook] Using existing hook server");
          resolve();
          return;
        }

        // Start the server
        const binaryPath = getBinaryPath();
        console.log("[Hook] Starting hook server...");

        this.process = spawn(binaryPath, [], {
          stdio: ["ignore", "ignore", "ignore"],
        });

        this.process.on("error", (err) => {
          console.error("[Hook] Failed to start binary:", err.message);
          reject(new Error(`Failed to start hook server: ${err.message}`));
        });

        this.process.on("exit", (code) => {
          if (code !== 0) {
            console.error("[Hook] Binary exited with code:", code);
            reject(new Error(`Hook server exited with code ${code}`));
          }
        });

        const checkSocket = setInterval(() => {
          if (fs.existsSync(SOCKET_PATH)) {
            console.log("[Hook] Server is ready and accepting connections");
            clearInterval(checkSocket);
            clearTimeout(timeoutId);
            resolve();
          }
        }, 100);

        const timeoutId = setTimeout(() => {
          console.error("[Hook] Timeout waiting for socket");
          clearInterval(checkSocket);
          if (this.process && !this.process.killed) {
            this.process.kill();
          }
          reject(new Error("Timeout waiting for hook server to start"));
        }, 5000);
      } catch (error) {
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  private async makeRequest<T>(path: string): Promise<T> {
    await this.ensureServerRunning();

    return new Promise<T>((resolve, reject) => {
      const options = {
        socketPath: SOCKET_PATH,
        path: path,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      };

      const req = http.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            if (res.statusCode !== 200) {
              reject(new Error(`HTTP error! status: ${res.statusCode}`));
              return;
            }

            const parsedData = JSON.parse(data);
            resolve(parsedData);
          } catch (error) {
            reject(
              new Error(
                `Error parsing response: ${
                  error instanceof Error ? error.message : String(error)
                }`
              )
            );
          }
        });
      });

      req.on("error", (error) => {
        reject(new Error(`Request error: ${error.message}`));
      });

      req.end();
    });
  }

  /**
   * Get license information
   * @returns License information
   */
  async license(): Promise<LicenseInfo> {
    return this.makeRequest<LicenseInfo>("/license");
  }

  /**
   * Cleanup resources
   */
  async close(): Promise<void> {
    if (this.process && !this.process.killed) {
      this.process.kill();
    }
  }
}

// Create and export a singleton instance
const hookClient = new HookClient();

// Export the license function directly
export const license = () => hookClient.license();

// Export the client for more control
export default hookClient;
