const fs = require("fs");
const path = require("path");
const freezePath = path.join(__dirname, "..", "frozen.json");

module.exports = async function ({ api, event }) {
  // Check if bot is frozen
  if (fs.existsSync(freezePath)) {
    const { frozen } = JSON.parse(fs.readFileSync(freezePath));
    if (frozen && event.body && !event.body.startsWith(".freeze")) return;
  }

  // এখানে তোমার আগের message handling চলবে
};
