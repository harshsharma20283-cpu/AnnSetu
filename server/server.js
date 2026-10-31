const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const supabase = require("./supabaseClient");
const itemsRouter = require("./routes/items");
const shelfLifeRouter = require("./routes/shelfLife");
const authRouter = require("./routes/auth");
const uploadRouter = require("./routes/upload");
const aiRouter = require("./routes/ai");
const { initCron } = require("./utils/cron");

const app = express();

// Required on Render so the real client IP is used for rate limiting
app.set("trust proxy", 1);

// If the frontend is hosted on a different domain, set FRONTEND_URL to allow only that domain.
// When the API serves the frontend itself (same origin), CORS is not needed.
const frontendUrl = process.env.FRONTEND_URL;
app.use(cors(frontendUrl ? { origin: frontendUrl } : undefined));

// Larger limit so photo uploads sent as base64 are not rejected
app.use(express.json({ limit: "10mb" }));

// Paid OpenAI key: max 10 scan requests per IP every 15 minutes
const scanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { error: "Too many scan requests, please try again later" },
});

// Login and upload endpoints: limit repeated attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: { error: "Too many requests, please try again later" },
});

// Health check (kept off "/" so the React app can use the home page)
app.get("/health", (req, res) =>
  res.json({
    name: "AnnSetu API",
    version: "1.2.0",
    status: "running",
    features: ["items-crud", "shelf-life-engine", "auth", "photo-upload", "daily-cron"],
  })
);

// Test route: checks whether the database connection works (no secrets in the response)
app.get("/test-db", async (req, res) => {
  const { count, error } = await supabase
    .from("items")
    .select("*", { count: "exact", head: true });

  if (error) return res.status(500).json({ ok: false, error: error.message });
  res.json({ ok: true, itemsCount: count });
});

// App endpoints
app.use("/auth", authLimiter, authRouter);
app.use("/items", itemsRouter);
app.use("/shelf-life", shelfLifeRouter);
app.use("/upload", authLimiter, uploadRouter);
app.use("/ai", scanLimiter, aiRouter);

// Serve the React production build if it exists
const clientDist = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));

  const apiPrefixes = ["/items", "/auth", "/shelf-life", "/upload", "/ai", "/test-db", "/health"];
  // Fallback: any other GET request gets index.html (works in Express 4 and 5)
  app.use((req, res, next) => {
    if (req.method !== "GET" || apiPrefixes.some((p) => req.path.startsWith(p))) {
      return next();
    }
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

// Start the automated daily expiry cron job
initCron();

const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
  if (err) {
    console.error("Server failed to start:", err.message);
    process.exit(1);
  }
  console.log(`Server running on port ${PORT}`);
});