const fs = require("fs");
const path = require("path");
const freezePath = path.join(__dirname, "..", "frozen.json");

if (fs.existsSync(freezePath)) {
  const { frozen } = JSON.parse(fs.readFileSync(freezePath));
  if (frozen && event.body && !event.body.startsWith(".unfreeze")) return;
}
