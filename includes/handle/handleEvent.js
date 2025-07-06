‎module.exports = function ({ api, models, Users, Threads, Currencies }) {
‎  const logger = require("../../utils/log.js");
‎  const moment = require("moment");
‎  const fs = require("fs");
‎  const path = require("path");
‎  const freezePath = path.join(__dirname, "..","..", "frozen.json"); // ✅ freeze check এর path
‎
‎  return function ({ event }) {
‎    const timeStart = Date.now();
‎    const time = moment.tz("Asia/Kolkata").format("HH:MM:ss L");
‎    const { userBanned, threadBanned } = global.data;
‎    const { events } = global.client;
‎    const { allowInbox, DeveloperMode } = global.config;
‎    var { senderID, threadID } = event;
‎    senderID = String(senderID);
‎    threadID = String(threadID);
‎
‎    // ✅ ফ্রিজ চেক
‎    if (fs.existsSync(freezePath)) {
‎      const { frozen } = JSON.parse(fs.readFileSync(freezePath));
‎      if (frozen) return; // ফ্রিজ থাকলে event কাজ করবে না
‎    }
‎
‎    if (userBanned.has(senderID) || threadBanned.has(threadID) || allowInbox == ![] && senderID == threadID) return;
‎    if (event.type == "change_thread_image") event.logMessageType = "change_thread_image";
‎
‎    for (const [key, value] of events.entries()) {
‎      if (value.config.eventType.indexOf(event.logMessageType) !== -1) {
‎        const eventRun = events.get(key);
‎        try {
‎          const Obj = {
‎            api,
‎            event,
‎            models,
‎            Users,
‎            Threads,
‎            Currencies
‎          };
‎          eventRun.run(Obj);
‎          if (DeveloperMode == !![])
‎            logger(global.getText('handleEvent', 'executeEvent', time, eventRun.config.name, threadID, Date.now() - timeStart), '[ Event ]');
‎        } catch (error) {
‎          logger(global.getText('handleEvent', 'eventError', eventRun.config.name, JSON.stringify(error)), "error");
‎        }
‎      }
‎    }
‎    return;
‎  };
‎};
‎
