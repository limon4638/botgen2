const fs = require("fs");
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const path = require("path");

module.exports.config = {
  name: "music",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Limon + ChatGPT",
  description: "Download audio from YouTube",
  commandCategory: "media",
  usages: "[song name]",
  cooldowns: 2,
};

module.exports.run = async ({ api, event, args }) => {
  const search = args.join(" ");
  if (!search) return api.sendMessage("🎶 গানটির নাম লিখুন...\n\n📌 যেমন: music mon majhi", event.threadID, event.messageID);

  const loading = await api.sendMessage("🔎 গান খোঁজা হচ্ছে, অপেক্ষা করুন...", event.threadID);

  try {
    const result = await ytSearch(search);
    if (!result.videos.length) return api.sendMessage("❌ কোনো গান পাওয়া যায়নি!", event.threadID, event.messageID);

    const video = result.videos[0];
    const url = video.url;

    const fileName = `${event.senderID}_music.mp3`;
    const filePath = path.join(__dirname, "cache", fileName);

    const stream = ytdl(url, {
      filter: "audioonly",
      quality: "highestaudio",
    });

    stream.pipe(fs.createWriteStream(filePath)).on("finish", () => {
      api.sendMessage({
        body: `🎵 ${video.title}\n⏱ সময়কাল: ${video.timestamp}\n📎 ইউটিউব: ${video.url}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => {
        fs.unlinkSync(filePath);
      }, event.messageID);
    });

    stream.on("error", (err) => {
      console.error(err);
      api.sendMessage("❌ গান ডাউনলোড করতে সমস্যা হয়েছে।", event.threadID, event.messageID);
    });

  } catch (err) {
    console.error(err);
    api.sendMessage("❌ সমস্যা হয়েছে। আবার চেষ্টা করুন।", event.threadID, event.messageID);
  }
};
