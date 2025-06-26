const axios = require("axios");
const fs = require("fs");
const path = require("path");

function getCookieString(appstatePath) {
  try {
    const appstate = JSON.parse(fs.readFileSync(appstatePath, "utf-8"));
    if (!Array.isArray(appstate)) return "";

    return appstate.map(c => `${c.name}=${c.value}`).join("; ");
  } catch {
    return "";
  }
}

module.exports = async function getMessageInfo(messageID) {
  // appstate.json ফাইল দুই ধাপ উপরে
  const appstatePath = path.join(__dirname, "..", "..", "appstate.json");
  const cookie = getCookieString(appstatePath);

  if (!cookie) {
    console.log("❌ appstate.json থেকে cookie পাওয়া যায়নি");
    return null;
  }

  try {
    const res = await axios.get("https://www.facebook.com/api/graphql/", {
      params: {
        fb_api_caller_class: "RelayModern",
        fb_api_req_friendly_name: "MessageInfoQuery",
        variables: JSON.stringify({ messageID }),
        doc_id: "2848441481886833"
      },
      headers: {
        cookie: cookie,
        "User-Agent": "Mozilla/5.0"
      }
    });

    if (res.data && res.data.data && res.data.data.message) {
      return res.data.data.message;
    } else {
      console.log("getMessageInfo: Invalid response");
      return null;
    }
  } catch (err) {
    console.error("getMessageInfo error:", err.message);
    return null;
  }
};
