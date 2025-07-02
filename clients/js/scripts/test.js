// Test script for the hook client
const { license } = require("../dist/index");

async function test() {
  try {
    const hookBinPath = process.env.HIPHOPS_HOOK_BIN || "default binary path";

    console.log("=".repeat(50));
    console.log("Testing hook client");
    console.log("-".repeat(50));
    console.log(`Using binary from: ${hookBinPath}`);
    console.log(`Current directory: ${process.cwd()}`);
    console.log("=".repeat(50));

    console.log("\nFetching license information...");
    const info = await license();

    console.log("\nLicense info:");
    console.log(JSON.stringify(info, null, 2));

    console.log("\n✅ Test completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Test failed with error:");
    console.error(error);
    process.exit(1);
  }
}

test();
