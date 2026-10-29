const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const supabase = require("./supabaseClient");
const itemsRouter = require("./routes/items");
const shelfLifeRouter = require("./routes/shelfLife");
const authRouter = require("./routes/auth");
const uploadRouter = require("./routes/upload");
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
  res.json({ ok: true, itemsCount: count });
});

// App Endpoints
app.use("/auth", authRouter);
app.use("/items", itemsRouter);
app.use("/shelf-life", shelfLifeRouter);
app.use("/upload", uploadRouter);

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
