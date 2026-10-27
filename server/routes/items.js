const express = require("express");
const supabase = require("../supabaseClient");
const { daysLeft, statusColor } = require("../utils/expiry");

const router = express.Router();

const LOCATIONS = ["fridge", "room", "freezer"];
const STATUSES = ["active", "used", "wasted"];

function withDays(item) {
  const d = daysLeft(item.expiry_date);
  return { ...item, daysLeft: d, color: statusColor(d) };
}

// POST /items : add a new item
router.post("/", async (req, res) => {
  const {
    name, category, photo_url, location, purchase_date,
    mfg_date, expiry_date, alert_date, expiry_source, price,
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "name is required" });
  }
  if (location && !LOCATIONS.includes(location)) {
    return res.status(400).json({ error: "location must be fridge, room or freezer" });
  }

  const { data, error } = await supabase
    .from("items")
    .insert({
      name: name.trim(), category, photo_url, location, purchase_date,
      mfg_date, expiry_date, alert_date, expiry_source, price,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(withDays(data));
});

// GET /items?status=active : list items, soonest expiry first
router.get("/", async (req, res) => {
  const status = req.query.status || "active";
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ error: "status must be active, used or wasted" });
  }

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("status", status)
    .order("expiry_date", { ascending: true, nullsFirst: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(withDays));
});

// PATCH /items/:id : edit an item, or mark it as used / wasted
router.patch("/:id", async (req, res) => {
  const allowed = [
    "name", "category", "photo_url", "location", "purchase_date",
    "mfg_date", "expiry_date", "alert_date", "expiry_source", "price", "status",
  ];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "no fields to update" });
  }
  if (updates.status && !STATUSES.includes(updates.status)) {
    return res.status(400).json({ error: "status must be active, used or wasted" });
  }
  if (updates.status === "used" || updates.status === "wasted") {
    updates.used_at = new Date().toISOString();
  }
  if (updates.status === "active") {
    updates.used_at = null;
  }

  const { data, error } = await supabase
    .from("items")
    .update(updates)
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") return res.status(404).json({ error: "item not found" });
    return res.status(500).json({ error: error.message });
  }
  res.json(withDays(data));
});

// DELETE /items/:id : remove an item
router.delete("/:id", async (req, res) => {
  const { error } = await supabase.from("items").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

module.exports = router;