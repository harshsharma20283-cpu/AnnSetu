const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const supabase = require("./supabaseClient");
const itemsRouter = require("./routes/items");
const shelfLifeRouter = require("./routes/shelfLife");
const authRouter = require("./routes/auth");
const uploadRouter = require("./routes/upload");
const aiRouter = require("./routes/ai");
const { initCron } = require("./utils/cron");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ 
  name: "AnnSetu API", 
  version: "1.2.0", 
  status: "running",
  features: ["items-crud", "shelf-life-engine", "auth", "photo-upload", "daily-cron"] 
}));

// Test route: checks whether the database connection works
app.get("/test-db", async (req, res) => {
  const { count, error } = await supabase
    .from("items")
    .select("*", { count: "exact", head: true });

  if (error) return res.status(500).json({ ok: false, error: error.message });
  res.json({ 
    ok: true, 
    itemsCount: count,
    keyPrefix: process.env.SUPABASE_SECRET_KEY ? process.env.SUPABASE_SECRET_KEY.slice(0, 10) : 'none',
    url: process.env.SUPABASE_URL 
  });
});

// App Endpoints
app.use("/auth", authRouter);
app.use("/items", itemsRouter);
app.use("/shelf-life", shelfLifeRouter);
app.use("/upload", uploadRouter);
app.use("/ai", aiRouter);

// Serve static React production build if available
const clientDist = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (
      req.path.startsWith("/items") ||
      req.path.startsWith("/auth") ||
      req.path.startsWith("/shelf-life") ||
      req.path.startsWith("/upload") ||
      req.path.startsWith("/ai") ||
      req.path.startsWith("/test-db")
    ) {
      return next();
    }
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

// Start Automated Daily Expiry Cron Job
initCron();

const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
  if (err) {
    console.error("Server failed to start:", err.message);
    process.exit(1);
  }
  console.log(`Server running on port ${PORT}`);
});
