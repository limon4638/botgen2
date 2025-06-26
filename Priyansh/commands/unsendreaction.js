module.exports.config = {
  name: "unsendreaction",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Kawsar + Priyansh",
  description: "React দিয়ে বটের মেসেজ আনসেন্ড",
  commandCategory: "system",
  usages: "react 👍 to bot msg",
  cooldowns: 0
};

const getMessageInfo = require("./getMessageInfo");

module.exports.handleReaction = async function ({ api, event }) {
  const { messageID, reaction } = event;

  if (reaction !== "👍") return;

  try {
    const msgInfo = await getMessageInfo(messageID);
    if (!msgInfo) return;

    const botID = api.getCurrentUserID();
    if (msgInfo.message_sender.id !== botID) return;

    await api.unsendMessage(messageID);
  } catch (e) {
    console.error("unsendreaction error:", e.message);
  }
};
