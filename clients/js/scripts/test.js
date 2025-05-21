// Test script for the hook client
const { license } = require("../dist/index");

async function test() {
  try {
    console.log("Testing hook client...");
    const info = await license();
    console.log("License info:", info);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

test();
