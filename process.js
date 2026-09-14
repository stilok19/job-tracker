const https = require("https");
const fs = require("fs");

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwpH5aYzX17YzsMA0uNBd01V0pANtGyFxIRdZNzQDPNf4a2kK2obViqkcFkfqJCQK_SYA/exec";

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

async function run() {
  const pending = JSON.parse(fs.readFileSync("pending.json", "utf8"));
  if (!pending.queue || pending.queue.length === 0) {
    console.log("No pending items.");
    return;
  }

  for (const item of pending.queue) {
    const params = new URLSearchParams(item).toString();
    const url = `${SCRIPT_URL}?${params}`;
    try {
      const result = await fetchUrl(url);
      console.log(`OK: ${item.role_title || item.recruiter_name} -> ${result}`);
    } catch (err) {
      console.error(`FAIL: ${item.role_title || item.recruiter_name} -> ${err.message}`);
    }
  }

  fs.writeFileSync("pending.json", JSON.stringify({ queue: [] }, null, 2));
  console.log("Queue cleared.");
}

run();
