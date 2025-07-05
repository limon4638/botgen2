const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");
const https = require("https");

function deleteAfterTimeout(filePath, timeout = 60000) {
  setTimeout(() => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (!err) {
          console.log(`✅ Deleted file: ${filePath}`);
        } else {
          console.error(`❌ Error deleting file: ${err.message}`);
        }
      });
    }
  }, timeout);
}

module.exports = {
  config: {
    name: "music",
    version: "2.0.3",
    hasPermssion: 0,
    credits: "limon + ChatGPT Fix",
    description: "Download YouTube song or video",
    commandCategory: "Media",
    usages: "[song name] [optional: video]",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    if (args.length === 0) {
      return api.sendMessage("⚠️ Gaane ka naam to likho na! 😒", event.threadID);
    }

    const mediaType = args[args.length - 1].toLowerCase() === "video" ? "video" : "audio";
    const songName = mediaType === "video" ? args.slice(0, -1).join(" ") : args.join(" ");

    const processingMessage = await api.sendMessage(
      `🔍 "${songName}" dhoondh rahi hoon... Ruko zara! 😏`,
      event.threadID,
      null,
      event.messageID
    );

    try {
      const searchResults = await ytSearch(songName);
      if (!searchResults || !searchResults.videos.length) {
        throw new Error("Kuch nahi mila! Gaane ka naam sahi likho. 😑");
      }

      const topResult = searchResults.videos[0];
      const videoUrl = `https://www.youtube.com/watch?v=${topResult.videoId}`;
      const thumbnailUrl = topResult.thumbnail;
      const safeTitle = topResult.title.replace(/[<>:"/\\|?*\x00-\x1F]/g, "").substring(0, 50);
      const downloadDir = path.join(__dirname, "cache");
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
      }
      const thumbnailPath = path.join(downloadDir, `${safeTitle}.jpg`);

      const thumbnailFile = fs.createWriteStream(thumbnailPath);
      await new Promise((resolve, reject) => {
        https.get(thumbnailUrl, (response) => {
          response.pipe(thumbnailFile);
          thumbnailFile.on("finish", () => {
            thumbnailFile.close(resolve);
          });
        }).on("error", (error) => {
          console.error("Thumbnail error:", error.message);
          resolve(); // don't reject, just skip thumbnail
        });
      });

      await api.sendMessage(
        {
          attachment: fs.existsSync(thumbnailPath) ? fs.createReadStream(thumbnailPath) : null,
          body: `🎶 Title: ${topResult.title}\n⏳ Downloading ${mediaType}... Wait please!`,
        },
        event.threadID
      );

      deleteAfterTimeout(thumbnailPath);

      const apiUrl = `https://music-api-2.onrender.com/download?url=${encodeURIComponent(videoUrl)}&type=${mediaType}`;
      const downloadResponse = await axios.get(apiUrl, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      if (!downloadResponse.data.file_url) {
        throw new Error("Download fail ho gaya. 😭");
      }

      const downloadUrl = downloadResponse.data.file_url.replace("http:", "https:");
      const filename = `${safeTitle}.${mediaType === "video" ? "mp4" : "mp3"}`;
      const downloadPath = path.join(downloadDir, filename);

      const file = fs.createWriteStream(downloadPath);
      await new Promise((resolve, reject) => {
        https.get(downloadUrl, (response) => {
          if (response.statusCode === 200) {
            response.pipe(file);
            file.on("finish", () => {
              file.close(resolve);
            });
          } else {
            reject(new Error(`Download fail. Status: ${response.statusCode}`));
          }
        }).on("error", (error) => {
          fs.existsSync(downloadPath) && fs.unlinkSync(downloadPath);
          reject(new Error(`Error downloading file: ${error.message}`));
        });
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      await api.sendMessage(
        {
          attachment: fs.createReadStream(downloadPath),
          body: `🎵 Aapka ${mediaType === "video" ? "video 🎥" : "gaana 🎧"} tayyar hai! Enjoy 😍`,
        },
        event.threadID
      );

      deleteAfterTimeout(downloadPath);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      api.sendMessage(`❌ Error: ${error.message} 😢`, event.threadID);
    }
  },
};
