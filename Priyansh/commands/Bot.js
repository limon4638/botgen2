const axios = require('axios');

const baseApiUrl = async () => {
  const base = await axios.get(`https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`);
  return base.data.api;
};

module.exports.config = {
  name: "baby",
  version: "6.9.9",
  credits: "Limon",
  cooldowns: 0,
  hasPermssion: 0,
  description: "better than all sim simi",
  commandCategory: "chat",
  category: "chat",
  usePrefix: true,
  prefix: true,
  usages: `[anyMessage] OR\nteach [YourMessage] - [Reply1], [Reply2], ... OR\nteach react [YourMessage] - [react1], ... OR\nremove [YourMessage] OR\nrm [YourMessage] - [indexNumber] OR\nmsg [YourMessage] OR\nlist OR\nall OR\nedit [YourMessage] - [NewMessage]`,
};

module.exports.run = async function ({ api, event, args, Users }) {
  try {
    const link = `${await baseApiUrl()}/baby`;
    const input = args.join(" ").toLowerCase();
    const uid = event.senderID;

    if (!args[0]) {
      const ran = ["Bolo baby", "hum", "type help baby", "type !baby hi"];
      return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID, event.messageID);
    }

    const sendMessage = (msg) => api.sendMessage(msg, event.threadID, event.messageID);

    if (args[0] === 'remove') {
      const message = input.replace("remove ", "");
      const res = await axios.get(`${link}?remove=${encodeURIComponent(message)}&senderID=${uid}`);
      return sendMessage(res.data.message);
    }

    if (args[0] === 'rm' && input.includes('-')) {
      const [msg, index] = input.replace("rm ", "").split(' - ');
      const res = await axios.get(`${link}?remove=${encodeURIComponent(msg)}&index=${index}`);
      return sendMessage(res.data.message);
    }

    if (args[0] === 'list') {
      const res = await axios.get(`${link}?list=all`);
      const data = res.data.teacher?.teacherList || [];
      if (args[1] === 'all') {
        const teachers = await Promise.all(data.map(async (item) => {
          const number = Object.keys(item)[0];
          const value = item[number];
          const name = await Users.getName(number) || "unknown";
          return { name, value };
        }));
        teachers.sort((a, b) => b.value - a.value);
        const output = teachers.map((t, i) => `${i + 1}/ ${t.name}: ${t.value}`).join('\n');
        return sendMessage(`Total Teach = ${data.length}\n\n👑 | List of Teachers of baby\n${output}`);
      } else {
        return sendMessage(`Total Teach = ${data.length}`);
      }
    }

    if (['msg', 'message'].includes(args[0])) {
      const key = input.replace(/^msg\s+/, "");
      const res = await axios.get(`${link}?list=${encodeURIComponent(key)}`);
      return sendMessage(`Message ${key} = ${res.data.data}`);
    }

    if (args[0] === 'edit') {
      if (!input.includes(' - ')) return sendMessage('❌ | Invalid format! Use: edit [YourMessage] - [NewReply]');
      const [msg, replacement] = input.replace("edit ", "").split(' - ');
      if (replacement.length < 2) return sendMessage('❌ | New reply is too short.');
      const res = await axios.get(`${link}?edit=${encodeURIComponent(msg)}&replace=${encodeURIComponent(replacement)}`);
      return sendMessage(`✅ Changed: ${res.data.message}`);
    }

    if (args[0] === 'teach') {
      if (!input.includes(' - ')) return sendMessage('❌ | Invalid format for teach command.');
      const [prefixPart, replies] = input.split(' - ');
      const msg = prefixPart.replace("teach", "").replace("react", "").replace("amar", "").trim();

      if (args[1] === 'react') {
        const res = await axios.get(`${link}?teach=${encodeURIComponent(msg)}&react=${encodeURIComponent(replies)}`);
        return sendMessage(`✅ React replies added: ${res.data.message}`);
      }

      if (args[1] === 'amar') {
        const res = await axios.get(`${link}?teach=${encodeURIComponent(msg)}&senderID=${uid}&reply=${encodeURIComponent(replies)}&key=intro`);
        return sendMessage(`✅ Intro replies added: ${res.data.message}`);
      }

      const res = await axios.get(`${link}?teach=${encodeURIComponent(msg)}&reply=${encodeURIComponent(replies)}&senderID=${uid}`);
      const name = await Users.getName(res.data.teacher) || "unknown";
      return sendMessage(`✅ Replies added: ${res.data.message}\nTeacher: ${name}\nTeachs: ${res.data.teachs}`);
    }

    if (['amar name ki', 'amr nam ki', 'amar nam ki', 'amr name ki'].some(q => input.includes(q))) {
      const res = await axios.get(`${link}?text=amar name ki&senderID=${uid}&key=intro`);
      return sendMessage(res.data.reply);
    }

    // Default chatbot response
    const res = await axios.get(`${link}?text=${encodeURIComponent(input)}&senderID=${uid}&font=1`);
    return api.sendMessage(res.data.reply, event.threadID, (error, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: uid,
        lnk: res.data.reply,
        apiUrl: link
      });
    }, event.messageID);

  } catch (e) {
    console.error('Error in command execution:', e);
    return api.sendMessage(`Error: ${e.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  try {
    if (event.type === "message_reply") {
      const replyText = event.body.toLowerCase();
      if (isNaN(replyText)) {
        const res = await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(replyText)}&senderID=${event.senderID}&font=1`);
        return api.sendMessage(res.data.reply, event.threadID, (error, info) => {
          global.client.handleReply.push({
            name: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            lnk: res.data.reply
          });
        }, event.messageID);
      }
    }
  } catch (err) {
    return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleEvent = async function ({ api, event }) {
  try {
    const body = event.body ? event.body.toLowerCase() : "";
    if (body.startsWith("baby") || body.startsWith("shiri") || body.startsWith("/bot")) {
      const msg = body.replace(/^\S+\s*/, "");
      if (!msg) {
        return api.sendMessage("hum xan bolo ami asi", event.threadID, (error, info) => {
          global.client.handleReply.push({
            name: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID
          });
        }, event.messageID);
      }

      const res = await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(msg)}&senderID=${event.senderID}&font=1`);
      return api.sendMessage(res.data.reply, event.threadID, (error, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          lnk: res.data.reply
        });
      }, event.messageID);
    }
  } catch (err) {
    return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
  }
};
