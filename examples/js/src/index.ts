import "dotenv/config";
import express from "express";
import { license } from "@hiphops/hook";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// License information endpoint
app.get("/license", async (req, res) => {
  try {
    const licenseInfo = await license();
    res.json(licenseInfo);
  } catch (error) {
    console.error("License error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Hook Example running on port ${port}`);
  console.log(`🔑 License token configured: ${!!process.env.LICENSE_TOKEN}`);
});
