module.exports = function ({ api, models, Users, Threads, Currencies }) {
  return async function ({ event }) {
    const { handleReaction, commands } = global.client;
    const { messageID, threadID, reaction, userID } = event;

    // 🔁 1. Check if anyone reacted to a bot's message with 👍 or 👎
    try {
      if (reaction === "👍" || reaction === "👎") {
        const botID = api.getCurrentUserID();
        const msgInfo = await api.getMessageInfo(messageID, threadID);

        if (msgInfo?.senderID === botID) {
          const userData = await Users.getData(userID) || {};
          const hasPerm = userData.hasPermssion || 0;
          if (hasPerm >= 1) {
            await api.unsendMessage(messageID);
            return; // unsend হয়ে গেলে নিচের কোড চলবে না
          }
        }
      }
    } catch (error) {
      console.log("[autoUnsendError] »", error.message);
    }

    // 🔁 2. Default handleReaction logic (for commands)
    if (handleReaction.length !== 0) {
      const indexOfHandle = handleReaction.findIndex(e => e.messageID == messageID);
      if (indexOfHandle < 0) return;
      const indexOfMessage = handleReaction[indexOfHandle];
      const handleNeedExec = commands.get(indexOfMessage.name);
      if (!handleNeedExec)
        return api.sendMessage(global.getText('handleReaction', 'missingValue'), threadID, messageID);
      try {
        var getText2;
        if (handleNeedExec.languages && typeof handleNeedExec.languages == 'object')
          getText2 = (...value) => {
            const react = handleNeedExec.languages || {};
            if (!react.hasOwnProperty(global.config.language))
              return api.sendMessage(global.getText('handleCommand', 'notFoundLanguage', handleNeedExec.config.name), threadID, messageID);
            var lang = handleNeedExec.languages[global.config.language][value[0]] || '';
            for (var i = value.length; i > 0; i--) {
              const expReg = RegExp('%' + i, 'g');
              lang = lang.replace(expReg, value[i]);
            }
            return lang;
          };
        else getText2 = () => {};
        const Obj = {
          api,
          event,
          models,
          Users,
          Threads,
          Currencies,
          handleReaction: indexOfMessage,
          getText: getText2
        };
        handleNeedExec.handleReaction(Obj);
        return;
      } catch (error) {
        return api.sendMessage(global.getText('handleReaction', 'executeError', error), threadID, messageID);
      }
    }
  };
};
