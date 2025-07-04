const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports.config = {
  name: "arrest",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "MAHBUB SHAON",
  description: "Arrest a friend you mention",
  commandCategory: "tagfun",
  usages: "[mention]",
  cooldowns: 2,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "path": "",
    "jimp": ""
  }
};

module.exports.onLoad = async () => {
  const dir = path.join(__dirname, "cache", "canvas");
  const imagePath = path.join(dir, "batgiam.png");

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (!fs.existsSync(imagePath)) {
    try {
      const imgData = (await axios.get("https://i.imgur.com/ep1gG3r.png", { responseType: "arraybuffer" })).data;
      fs.writeFileSync(imagePath, Buffer.from(imgData));
      console.log("✅ batgiam.png downloaded successfully.");
    } catch (e) {
      console.error("❌ Failed to download batgiam.png:", e.message);
    }
  }
};

async function circle(imagePath) {
  const image = await jimp.read(imagePath);
  image.circle();
  return await image.getBufferAsync("image/png");
}

async function makeImage({ one, two }) {
  const __root = path.join(__dirname, "cache", "canvas");
  const background = await jimp.read(path.join(__root, "batgiam.png"));
  const pathImg = path.join(__root, `batgiam_${one}_${two}.png`);
  const avatarOnePath = path.join(__root, `avt_${one}.png`);
  const avatarTwoPath = path.join(__root, `avt_${two}.png`);

  const getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarOnePath, Buffer.from(getAvatarOne));

  const getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarTwoPath, Buffer.from(getAvatarTwo));

  const circleOne = await jimp.read(await circle(avatarOnePath));
  const circleTwo = await jimp.read(await circle(avatarTwoPath));

  background.resize(500, 500)
    .composite(circleOne.resize(100, 100), 375, 9)
    .composite(circleTwo.resize(100, 100), 160, 92);

  const finalImage = await background.getBufferAsync("image/png");
  fs.writeFileSync(pathImg, finalImage);
  fs.unlinkSync(avatarOnePath);
  fs.unlinkSync(avatarTwoPath);

  return pathImg;
}

module.exports.run = async function ({ event, api, args }) {
  const { threadID, messageID, senderID } = event;
  const mention = Object.keys(event.mentions)[0];

  if (!mention) {
    return api.sendMessage("⚠️ Please mention 1 person to arrest!", threadID, messageID);
  }

  const tag = event.mentions[mention].replace("@", "");
  const one = senderID;
  const two = mention;

  try {
    const imagePath = await makeImage({ one, two });
    return api.sendMessage({
      body: `╭──────•◈•───────╮\n Limon chat cat \n\n—হালা গরু চোর তোরে আজকে হাতে নাতে ধরছি পালাবি কই_😸💁‍♀️ ${tag}\n\n𝗠𝗔𝗗𝗘 𝗕𝗬:\n Limon \n╰──────•◈•───────╯`,
      mentions: [{ tag: tag, id: mention }],
      attachment: fs.createReadStream(imagePath)
    }, threadID, () => fs.unlinkSync(imagePath), messageID);
  } catch (e) {
    console.error("Error generating arrest image:", e.message);
    return api.sendMessage("❌ Error generating image. Try again later.", threadID, messageID);
  }
};
