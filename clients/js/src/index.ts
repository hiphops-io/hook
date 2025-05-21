import { spawn, ChildProcess } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
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
  const __filename = new URL("", import.meta.url).pathname;
  return path.dirname(path.dirname(__filename));
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
  private isReady = false;

  constructor() {
    this.ensureServerRunning();
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
          // Try to connect to the socket first
          this.isReady = true;
          resolve();
          return;
        }

        // Start the server
        const binaryPath = getBinaryPath();
        this.process = spawn(binaryPath, [], {
          stdio: ["ignore", "pipe", "pipe"],
        });

        if (!this.process.stdout || !this.process.stderr) {
          throw new Error(
            "Failed to start hook server: stdout or stderr is null"
          );
        }

        // Handle process output
        this.process.stdout.on("data", (data) => {
          const message = data.toString().trim();
          if (message.includes("started server")) {
            this.isReady = true;
            resolve();
          }
        });

        this.process.stderr.on("data", (data) => {
          console.error(`Hook server error: ${data}`);
        });

        this.process.on("error", (err) => {
          reject(new Error(`Failed to start hook server: ${err.message}`));
        });

        this.process.on("exit", (code) => {
          if (code !== 0 && !this.isReady) {
            reject(new Error(`Hook server exited with code ${code}`));
          }
        });

        // Set a timeout for server startup
        setTimeout(() => {
          if (!this.isReady) {
            // Check if socket exists anyway
            if (fs.existsSync(SOCKET_PATH)) {
              this.isReady = true;
              resolve();
            } else {
              reject(new Error("Timeout waiting for hook server to start"));
            }
          }
        }, 5000);
      } catch (error) {
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  private async makeRequest<T>(path: string): Promise<T> {
    await this.ensureServerRunning();

    // Support both Node.js and other environments
    const fetch = globalThis.fetch || (await import("node-fetch")).default;

    const response = await fetch(`http://unix:${SOCKET_PATH}:${path}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<T>;
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
