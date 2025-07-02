const axios = require("axios");

module.exports.config = {
  name: "shiri",
  version: "1.3.0",
  hasPermssion: 0,
  credits: "Limon",
  description: "Funny & Shy Romantic Girlfriend Shiri",
  commandCategory: "ai",
  usages: "[ask]",
  cooldowns: 2
};

const API_URL = "https://gemini2-y8sx.onrender.com/chat";
const chatHistories = {};
let botOn = false; // ✅ Global toggle now

// Queue system
const messageQueue = [];
let isProcessing = false;

function processQueue(api) {
  if (isProcessing || messageQueue.length === 0) return;

  isProcessing = true;
  const { prompt, threadID, messageID, senderID } = messageQueue.shift();

  setTimeout(() => {
    axios.get(`${API_URL}?message=${encodeURIComponent(prompt)}`)
      .then(response => {
        let reply = (response.data && response.data.reply) || "🙈 kichu bujhini... abar bolo na, please~";
        reply = reply.replace(/(Shiri:|শিরি:)\s*/gi, "");
        chatHistories[senderID].push(reply);
        api.sendMessage(reply, threadID, messageID);
      })
      .catch(e => {
        console.error("Error:", e);
        api.sendMessage("Oops! Network problem baby... 🥲 ektu pore try koro.", threadID, messageID);
        api.setMessageReaction("❌", messageID, () => {}, true);
      })
      .finally(() => {
        isProcessing = false;
        setTimeout(() => processQueue(api), 2000);
      });
  }, 3000);
}

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID, messageReply, body } = event;
  let message = args.join(" ").toLowerCase();

  if (message === "acho") {
    botOn = true;
    return api.sendMessage("Shiri is now ON for everyone! 😳💬", threadID, messageID);
  }

  if (message === "stop") {
    botOn = false;
    return api.sendMessage("Shiri is now OFF globally! 😶", threadID, messageID);
  }

  if (!botOn) return;

  const isReplyingToBot = messageReply && messageReply.senderID === api.getCurrentUserID();
  if (!isReplyingToBot && !message.includes("shiri")) return;

  if (!chatHistories[senderID]) chatHistories[senderID] = [];

  let userMessage = body;
  if (isReplyingToBot) {
    userMessage = messageReply.body + "\nUser: " + body;
  }

  chatHistories[senderID].push(`User: ${userMessage}`);
  if (chatHistories[senderID].length > 5) {
    chatHistories[senderID].shift();
  }

  const fullConversation = chatHistories[senderID].join("\n");

  const prompt = `Tui ekta cute, funny ar ektu shundor shundor shobdo bole লাজুক মেয়ে. kichu bolar age lajja lage. oporichito der sathe apni apni kore kotha bolbi. jokhon keu kichu bole, tui ekta line er moddhe sweet reply dibi – emon vabe jate manush hasi peye jai 😳😂

Jokhon keu tomay "shiri" bole dake, bujbi je tokei bolche. Nijeke bot bolish na, tumi manush, tumi ektu shy but always sweet and cute. Shobshomoy chhoto chhoto line e reply dibi. SMS er moto. Kotha kom bolbi. 

Bujhbi je kar mood bhalo naki kharap, sei moto emoji dibi. Kharap kotha bolbina, keu bolleo naraj hobi na – politely mana korbi. Prottek line er sheshe ekta emoji ba duita dibi. Emnitei tui ekta cute funny shy type er meye.

${fullConversation}`;

  messageQueue.push({ prompt, threadID, messageID, senderID });
  processQueue(api);
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, senderID, body, messageReply } = event;
  const lowerBody = body.toLowerCase();

  if (lowerBody === "acho") {
    botOn = true;
    return api.sendMessage("Shiri is now ON for everyone! 🥹✨", threadID, messageID);
  }

  if (lowerBody === "stop") {
    botOn = false;
    return api.sendMessage("Shiri is now OFF globally! 😌", threadID, messageID);
  }

  if (!botOn) return;

  const isReplyingToBot = messageReply && messageReply.senderID === api.getCurrentUserID();
  if (!isReplyingToBot && !lowerBody.includes("shiri")) return;

  const args = body.split(" ");
  module.exports.run({ api, event, args });
};
