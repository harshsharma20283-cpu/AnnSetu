const cron = require("node-cron");
const supabase = require("../supabaseClient");
const { daysLeft } = require("./expiry");

async function checkExpiringItems() {
  console.log(`[${new Date().toISOString()}] Running Daily Expiry Audit...`);

  try {
    const { data: items, error } = await supabase
      .from("items")
      .select("*")
      .eq("status", "active");

    if (error) {
      console.error("Cron check failed to fetch items:", error.message);
      return [];
    }

    const urgentItems = items
      .map((it) => ({ ...it, daysLeft: daysLeft(it.expiry_date) }))
      .filter((it) => it.daysLeft !== null && it.daysLeft <= 1);

    if (urgentItems.length === 0) {
      console.log("✓ Daily Expiry Audit: All pantry items are fresh!");
      return [];
    }

    console.log(`⚠️ ATTENTION: ${urgentItems.length} items require urgent action!`);
    urgentItems.forEach((it) => {
      const statusStr = it.daysLeft <= 0 ? "EXPIRED TODAY" : "EXPIRES TOMORROW";
      console.log(`  - [${statusStr}] ${it.name} (${it.location})`);
    });

    return urgentItems;
  } catch (err) {
    console.error("Cron execution error:", err.message);
    return [];
  }
}

// Start daily cron at 08:30 AM every morning
function initCron() {
  cron.schedule("30 8 * * *", () => {
    checkExpiringItems();
  });
  console.log("✓ Daily Expiry Cron scheduled for 08:30 AM every morning.");
}

module.exports = { initCron, checkExpiringItems };
