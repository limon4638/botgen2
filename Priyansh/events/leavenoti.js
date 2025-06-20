module.exports.config = {
  name: "leave",
  eventType: ["log:unsubscribe"],
  version: "1.0.2",
  credits: "Modified by Kawsar",
  description: "Different messages for self leave and admin kick",
};

module.exports.run = async function({ api, event, Users }) {
  if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

  const leftID = event.logMessageData.leftParticipantFbId;
  const authorID = event.author;
  const name = await Users.getNameUser(leftID);

  // ম্যানশন অবজেক্ট
  const mention = [{ tag: name, id: leftID }];

  let msg = "";

  if (authorID == leftID) {
    // নিজে থেকে বের হলে
    msg = `@${name}, পাগল দের জন্য এই গ্রুপ না। আশা করি পাবনায় সিট পাবেন। \n \n\n বাণীতে: সোহানা`;
  } else {
    // অ্যাডমিন কিক করলে
    msg = ` @${name}, নে বাল পাকনামির ফল\n\n\n ইতি,\nসোহানা`;
  }

  return api.sendMessage({ body: msg, mentions: mention }, event.threadID);
};
