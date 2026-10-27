function daysLeft(expiryDate) {
  if (!expiryDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate + "T00:00:00");
  return Math.round((expiry - today) / (1000 * 60 * 60 * 24));
}

function statusColor(days) {
  if (days === null) return "grey";
  if (days <= 0) return "red";
  if (days <= 3) return "yellow";
  return "green";
}

module.exports = { daysLeft, statusColor };