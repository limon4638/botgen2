const fs = require("fs");
const path = require("path");

const freezePath = path.join(__dirname, "..", "frozen.json");
const ownerID = "100041684032472";

module.exports.config = {
  name: "unfreeze",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Limon + ChatGPT",
  description: "Unfreeze the bot",
  commandCategory: "system",
  usages: ".unfreeze",
  cooldowns: 3,
  usePrefix: true
};

module.exports.run = async function ({ api, event }) {
  if (event.senderID !== ownerID) return;

  fs.writeFileSync(freezePath, JSON.stringify({ frozen: false }));
  return api.sendMessage("✅ Bot is now active and responding!", event.threadID, event.messageID);
};
