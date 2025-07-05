const fs = require("fs");
const path = require("path");

const freezePath = path.join(__dirname, "..", "frozen.json");
const ownerID = "100041684032472";

module.exports.config = {
  name: "freeze",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Limon + ChatGPT",
  description: "Freeze the bot",
  commandCategory: "system",
  usages: ".freeze",
  cooldowns: 3,
  usePrefix: true
};

module.exports.run = async function ({ api, event }) {
  if (event.senderID !== ownerID) return;

  fs.writeFileSync(freezePath, JSON.stringify({ frozen: true }));
  return api.sendMessage("🤖 Bot is now frozen! All commands are disabled.", event.threadID, event.messageID);
};
