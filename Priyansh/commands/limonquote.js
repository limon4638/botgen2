const axios = require("axios");

module.exports.config = {
  name: "limonquote",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Limon Mia",
  description: "Send random quote from personal API",
  commandCategory: "fun",
  usages: "",
  cooldowns: 3,
};

module.exports.run = async function ({ api, event }) {
  try {
    const res = await axios.get("https://raw.githubusercontent.com/limon4638/limonapi/main/quotes.json");
    const quotes = res.data.quotes;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    return api.sendMessage(`💬 ${randomQuote}`, event.threadID, event.messageID);
  } catch (error) {
    return api.sendMessage("❌ কোট আনতে সমস্যা হয়েছে! API ঠিক আছে কিনা চেক করো।", event.threadID, event.messageID);
  }
};
