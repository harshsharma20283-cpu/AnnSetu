require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

app.get("/", (req, res) => res.send("Fridge Tracker API chal raha hai"));

// Test route: database se baat ho rahi hai ya nahi
app.get("/test-db", async (req, res) => {
  const { count, error } = await supabase
    .from("items")
    .select("*", { count: "exact", head: true });

  if (error) return res.status(500).json({ ok: false, error: error.message });
  res.json({ ok: true, itemsCount: count });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server port ${PORT} pe chal raha hai`));