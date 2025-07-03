const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");

module.exports = {
  config: {
    name: "music",
    version: "2.0.1",
    hasPermssion: 0,
    credits: "Limon + ChatGPT",
    description: "Download YouTube song using keyword",
    commandCategory: "media",
    usages: "[song name] [audio/video]",
    cooldowns: 5,
    dependencies: {
      "axios": "",
      "yt-search": ""
    }
  },

  run: async function ({ api, event, args }) {
    if (args.length === 0) {
      return api.sendMessage("❌ গান বা ভিডিওর নাম দাও!\n\n📌 উদাহরণ: music tujhe kitna chahne lage [audio/video]", event.threadID, event.messageID);
    }

    let type = "audio";
    if (["audio", "video"].includes(args[args.length - 1].toLowerCase())) {
      type = args.pop().toLowerCase();
    }

    const songName = args.join(" ");
    const processingMessage = await api.sendMessage(`🔍 "${songName}" খোঁজা হচ্ছে...`, event.threadID, event.messageID);

    try {
      const search = await ytSearch(songName);
      const video = search.videos[0];

      if (!video) {
        return api.sendMessage("❌ কোনো ফলাফল পাওয়া যায়নি!", event.threadID, event.messageID);
      }

      const videoUrl = video.url;
      const videoTitle = video.title;

      // ✅ নতুন API
      const apiUrl = `https://api.caliph.biz.id/api/dl/yt?url=${encodeURIComponent(videoUrl)}`;

      const res = await axios.get(apiUrl);
      const result = res.data;

      if (!result || !result.status || !result.result) {
        throw new Error("ডাউনলোড লিংক পাওয়া যায়নি!");
      }

      const fileUrl = type === "audio" ? result.result.audio.url : result.result.video.url;
      const ext = type === "audio" ? "mp3" : "mp4";
      const safeTitle = videoTitle.replace(/[^\w\s]/gi, "").slice(0, 50);
      const filePath = path.join(__dirname, "cache", `${safeTitle}.${ext}`);

      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }

      const writer = fs.createWriteStream(filePath);
      const downloadRes = await axios({ url: fileUrl, method: "GET", responseType: "stream" });
      downloadRes.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: `🎶 Title: ${videoTitle}\n✅ নিচে তোমার ${type} ফাইল:`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => {
          fs.unlinkSync(filePath);
          api.unsendMessage(processingMessage.messageID);
        }, event.messageID);
      });

      writer.on("error", err => {
        throw err;
      });

    } catch (err) {
      console.error("⛔ Error:", err.message);
      api.sendMessage(`❌ সমস্যা হয়েছে: ${err.message}`, event.threadID, event.messageID);
    }
  }
};
