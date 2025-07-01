const fs = require("fs");
const path = __dirname + "/cache/autoReact.json";
const emojiList = ["😀","😃","😄","😁","😆","😅","😂","🤣","😭","😉","😗","😙","😚","😘","🥰","😍","🤩","🥳","🙃","🙂","🥲","😊","☺️","😌","😏","🤤","😋","😛","😝","😜","🤪","🥴","😔","🥺","😬","😑","😐","😶","🤐","🤔","🤫","🤭","🥱","🤗","😱","🤨","🧐","😒","🙄","😤","😠","😡","🤬","😞","😓","😟","😥","😢","☹️","🙁","😕","😰","😨","😧","😦","😮","😯","😲","😳","🤯","😖","😣","😩","😫","😵","🥶","🥵","🤢","🤮","😴","😪","🤧","🤒","🤕","😷","🤥","😇","🤠","🤑","🤓","😎","🥸","🤡","😈","👿","👻","💀","☠️","👹","👺","🤖","🌚","🌝","😺","😸","😹","😻","😼","😽","🙀","😾","😿","🙈","🙉","🙊","🔥","💯","💥","🫂","💋","💝","💖","👍","👎","🤏","🤌","🤙","🤞","👌","✌️","✊","🤝","🌺","🌷","🌸","💮","🏵️","🍁","🍂","🌹","🌼","🐸","🍑","🍒","❌","✅"];

// ফাইল না থাকলে তৈরি করো, ডিফল্ট 'on'
if (!fs.existsSync(path)) {
  fs.writeFileSync(path, JSON.stringify({ on: true }, null, 2));
}

module.exports.config = {
  name: "autoreact",
  version: "2.0.0",
  hasPermssion: 2,
  credits: "kawsar",
  description: "Auto reaction system (on/off switch)",
  commandCategory: "utility",
  usages: "autoreact on/off",
  cooldowns: 5,
};

// ON/OFF command
module.exports.run = async function ({ api, event, args }) {
  const data = JSON.parse(fs.readFileSync(path));
  const choice = args[0];

  if (!choice || !["on", "off"].includes(choice.toLowerCase())) {
    return api.sendMessage("Usage: autoreact on / off", event.threadID, event.messageID);
  }

  data.on = choice.toLowerCase() === "on";
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
  return api.sendMessage(`Auto Reaction is now ${choice.toUpperCase()}`, event.threadID, event.messageID);
};

// Event listener for auto reaction
module.exports.handleEvent = async function ({ api, event }) {
  if (!event.body) return;

  try {
    const data = JSON.parse(fs.readFileSync(path));
    if (!data.on) return;

    const randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];
    api.setMessageReaction(randomEmoji, event.messageID, () => {}, true);
  } catch (err) {
    console.error("AutoReact Error:", err);
  }
};

module.exports.languages = {};

