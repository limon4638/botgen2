const fs = require("fs");
const path = require("path");

const freezePath = path.join(__dirname, "..", "freezeStatus.json");
const ownerID = "100041684032472"; // ✅ তোমার UID

module.exports.config = {
  name: "freeze",
  version: "1.0.3",
  hasPermission: 0,
  credits: "Limon + ChatGPT",
  description: "Freeze or unfreeze the bot",
  commandCategory: "system",
  usages: ".freeze on/off",
  cooldowns: 3,
  usePrefix: true // ✅ dot prefix সাপোর্ট
};

module.exports.run = async function ({ api, event, args }) {
  const senderID = event.senderID;
  if (senderID !== ownerID)
    return api.sendMessage("❌ You are not authorized to use this command.", event.threadID, event.messageID);

  if (!args[0] || !["on", "off"].includes(args[0])) {
    return api.sendMessage("❗ Usage: .freeze on/off", event.threadID, event.messageID);
  }

  const status = args[0] === "on";

  fs.writeFileSync(freezePath, JSON.stringify({ frozen: status }));

  if (!status) {
    return api.sendMessage("✅ Bot is now active!", event.threadID, event.messageID);
  }
  // freeze হলে চুপ থাকবে
};
