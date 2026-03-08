/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const pdf = require("pdf-parse");

async function main() {
  const dataBuffer = fs.readFileSync("AI_Programme_Week_Chatham_House_Notes.pdf");
  const data = await pdf(dataBuffer);
  fs.writeFileSync("docs/programme-notes.txt", data.text, "utf8");
  console.log(`Extracted ${data.text.length} characters`);
  console.log(data.text.substring(0, 2000));
}

main().catch(console.error);
