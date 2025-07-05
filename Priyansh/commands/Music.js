const fs = require("fs");
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const axios = require("axios");

module.exports.config = {
  name: "music",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Limon + ChatGPT",
  description: "Download music from YouTube",
  commandCategory: "media",
  usages: "[song name]",
  cooldowns: 2
};

module.exports.run = async ({ api, event, args }) => {
  const search = args.join(" ");
  if (!search) return api.sendMessage("🎶 গানটির নাম লিখুন...\n\nউদাহরণ: music Harano Din", event.threadID, event.messageID);

  try {
    const result = await ytSearch(search);
    if (!result.videos.length) return api.sendMessage("😔 কোনো ফলাফল পাওয়া যায়নি।", event.threadID, event.messageID);

    const video = result.videos[0];
    const stream = ytdl(video.url, { filter: "audioonly" });
    const filePath = __dirname + `/cache/${event.senderID}_music.mp3`;

    stream.pipe(fs.createWriteStream(filePath)).on("finish", () => {
      api.sendMessage({
        body: `🎵 গান: ${video.title}\n⏱ সময়কাল: ${video.timestamp}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
    });
  } catch (err) {
    console.log(err);
    api.sendMessage("❌ গান ডাউনলোড করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।", event.threadID, event.messageID);
  }
};
