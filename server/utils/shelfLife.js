const Fuse = require("fuse.js");
const items = require("../data/shelfLife.json");

const LOCATIONS = ["fridge", "room", "freezer"];

const fuse = new Fuse(items, {
  keys: ["name", "aliases"],
  threshold: 0.45,
  ignoreLocation: true,
});

function normalize(text) {
  return String(text || "").trim().toLowerCase().replace(/\s+/g, " ");
}

// Returns { item, exact, suggestions } for what the user typed
function findItem(input) {
  const query = normalize(input);
  if (!query) return { item: null, exact: false, suggestions: [] };

  // 1. Exact match
  const exact = items.find(
    (it) => it.name === query || it.aliases.some((a) => normalize(a) === query)
  );
  if (exact) {
    const more = fuse
      .search(query, { limit: 4 })
      .map((r) => r.item)
      .filter((i) => i.name !== exact.name);
    return { item: exact, exact: true, suggestions: [exact, ...more] };
  }

  // 2. Substring & word token match (e.g. "Amul Cow Milk" -> "milk", "Aashirvaad Sharbati Atta" -> "atta")
  const words = query.split(/\s+/).filter((w) => w.length > 2);
  const tokenMatch = items.find((it) => {
    const itName = normalize(it.name);
    if (query.includes(itName)) return true;
    if (it.aliases.some((a) => query.includes(normalize(a)))) return true;
    if (words.some((w) => itName === w || it.aliases.some((a) => normalize(a) === w))) return true;
    return false;
  });

  if (tokenMatch) {
    const more = fuse
      .search(query, { limit: 4 })
      .map((r) => r.item)
      .filter((i) => i.name !== tokenMatch.name);
    return { item: tokenMatch, exact: false, suggestions: [tokenMatch, ...more] };
  }

  // 3. Fuzzy search fallback
  const suggestions = fuse.search(query, { limit: 5 }).map((r) => r.item);
  return { item: suggestions[0] || null, exact: false, suggestions };
}

// 20% safety buffer, at least 1 day, never below 1 day
function safeDays(days) {
  const buffer = Math.max(1, Math.floor(days * 0.2));
  return Math.max(1, days - buffer);
}

function today() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// expiry_date = real estimate, alert_date = buffered estimate
function estimateExpiry(item, location, purchaseDate) {
  const days = item[location];
  if (days === null || days === undefined) return null;

  const start = purchaseDate || today();
  return {
    purchase_date: start,
    expiry_date: addDays(start, days),
    alert_date: addDays(start, safeDays(days)),
    shelf_life_days: days,
    expiry_source: "estimated",
  };
}

module.exports = { LOCATIONS, findItem, estimateExpiry, safeDays };
