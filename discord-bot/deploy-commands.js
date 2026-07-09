// Registers all slash commands with Discord so they appear in each server's
// command list. Run this once after inviting the bot, and again any time you
// add or change a command.
//
// Usage: node deploy-commands.js
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error("Missing DISCORD_TOKEN or CLIENT_ID. Check your .env file.");
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, "commands");
for (const file of fs.readdirSync(commandsPath).filter((f) => f.endsWith(".js"))) {
  const command = require(path.join(commandsPath, file));
  if (command?.data) commands.push(command.data.toJSON());
}

const rest = new REST().setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Deploying ${commands.length} slash command(s)...`);

    const route = GUILD_ID
      ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
      : Routes.applicationCommands(CLIENT_ID);

    await rest.put(route, { body: commands });

    console.log(
      GUILD_ID
        ? `Commands registered instantly to guild ${GUILD_ID}.`
        : "Commands registered globally (may take up to ~1 hour to appear everywhere).",
    );
  } catch (err) {
    console.error("Failed to deploy commands:", err);
    process.exit(1);
  }
})();
