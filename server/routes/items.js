const express = require("express");
const supabase = require("../supabaseClient");
const { daysLeft, statusColor } = require("../utils/expiry");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

const LOCATIONS = ["fridge", "room", "freezer"];
const STATUSES = ["active", "used", "wasted"];

function withDays(item) {
  const d = daysLeft(item.expiry_date);
  return { ...item, daysLeft: d, color: statusColor(d) };
}

// Apply optionalAuth to all item routes
router.use(optionalAuth);

// GET /items/alerts : Get urgent expiring items for notifications
router.get("/alerts", async (req, res) => {
  let query = supabase.from("items").select("*").eq("status", "active");

  if (req.user && req.user.id) {
    query = query.or(`user_id.eq.${req.user.id},user_id.is.null`);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  const alerts = data
    .map(withDays)
    .filter((it) => it.daysLeft !== null && it.daysLeft <= 1);

  res.json({ count: alerts.length, items: alerts });
});

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

  const userId = req.user ? req.user.id : null;

  let cleanExpirySource = null;
  if (expiry_source === "estimated" || expiry_source === "printed") {
    cleanExpirySource = expiry_source;
  } else if (expiry_source === "manual" || expiry_source) {
    cleanExpirySource = "printed";
  }

  const { data, error } = await supabase
    .from("items")
    .insert({
      user_id: userId,
      name: name.trim(),
      category: category || "general",
      photo_url: photo_url || null,
      location: location || "fridge",
      purchase_date: purchase_date || null,
      mfg_date: mfg_date || null,
      expiry_date: expiry_date || null,
      alert_date: alert_date || null,
      expiry_source: cleanExpirySource,
      price: price ? parseFloat(price) : null,
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

  let query = supabase
    .from("items")
    .select("*")
    .eq("status", status)
    .order("expiry_date", { ascending: true, nullsFirst: false });

  if (req.user && req.user.id) {
    query = query.or(`user_id.eq.${req.user.id},user_id.is.null`);
  }

  const { data, error } = await query;

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
  if (updates.expiry_source) {
    if (updates.expiry_source === "manual") updates.expiry_source = "printed";
    else if (updates.expiry_source !== "estimated" && updates.expiry_source !== "printed") {
      updates.expiry_source = null;
    }
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
