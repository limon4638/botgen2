const fs = require("fs");
const path = require("path");

const freezePath = path.join(__dirname, "freezeStatus.json");
const ownerID = "100041684032472"; // ✅ তোমার UID

// ফাইল না থাকলে ডিফল্ট frozen = false বানায়
if (!fs.existsSync(freezePath)) {
  fs.writeFileSync(freezePath, JSON.stringify({ frozen: false }, null, 2));
}

module.exports.config = {
  name: "freeze",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Limon + ChatGPT",
  description: "Freeze or unfreeze the bot",
  commandCategory: "system",
  usages: "[on/off]",
  cooldowns: 3
};

module.exports.run = async function ({ api, event, args }) {
  const senderID = event.senderID;

  if (senderID !== ownerID) return;

  const status = JSON.parse(fs.readFileSync(freezePath));
  const cmd = args[0];

  if (cmd === "on") {
    status.frozen = true;
    fs.writeFileSync(freezePath, JSON.stringify(status, null, 2));
    // ❄️ ফ্রিজ হলে কিছু মেসেজ দিবে না
  } else if (cmd === "off") {
    status.frozen = false;
    fs.writeFileSync(freezePath, JSON.stringify(status, null, 2));
    return api.sendMessage("✅ Bot is now active!", event.threadID, event.messageID);
  } else {
    return api.sendMessage("ℹ️ Usage: freeze on/off", event.threadID, event.messageID);
  }
};

module.exports.handleEvent = function ({ event }) {
  const status = JSON.parse(fs.readFileSync(freezePath));
  if (status.frozen && event.body) return; // ❄️ ফ্রিজ থাকলে কোনো কিছু করবে না
};
