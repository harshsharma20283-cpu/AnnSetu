const express = require("express");
const shelfLifeData = require("../data/shelfLife.json");
const { LOCATIONS, findItem, estimateExpiry } = require("../utils/shelfLife");

const router = express.Router();

// GET /shelf-life/categories : list unique categories
router.get("/categories", (req, res) => {
  const categories = [...new Set(shelfLifeData.map((it) => it.category))];
  res.json(categories);
});

// GET /shelf-life/items : list all pantry shelf life items
router.get("/items", (req, res) => {
  res.json(shelfLifeData);
});

// GET /shelf-life/suggest?q=pan : autocomplete suggestions
router.get("/suggest", (req, res) => {
  const { suggestions } = findItem(req.query.q);
  res.json(suggestions.map((s) => ({ name: s.name, category: s.category })));
});

// POST /shelf-life/estimate : estimate expiry for a loose item
router.post("/estimate", (req, res) => {
  const { name, location = "fridge", purchase_date } = req.body;

  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: "name is required" });
  }
  if (!LOCATIONS.includes(location)) {
    return res.status(400).json({ error: "location must be fridge, room or freezer" });
  }

  const { item, exact, suggestions } = findItem(name);
  if (!item) {
    return res.status(404).json({ error: "item not found", suggestions: [] });
  }

  const estimate = estimateExpiry(item, location, purchase_date);
  if (!estimate) {
    return res.status(422).json({
      error: `no shelf life data for ${item.name} in ${location}`,
      match: item.name,
    });
  }

  // exact = false means the match was a guess, so the client must ask the user to confirm it
  res.json({
    match: item.name,
    category: item.category,
    exact,
    needs_confirmation: !exact,
    suggestions: suggestions.map((s) => s.name),
    location,
    ...estimate,
  });
});

module.exports = router;
