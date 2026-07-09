// Registers all slash commands with Discord so they appear in each server's
// command list. Run this once after inviting the bot, and again any time you
// add or change a command.
//
// Usage: node deploy-commands.js
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");
const appConfig = require("./config/appConfig.json");

const { DISCORD_TOKEN, GUILD_ID } = process.env;
// The client/application ID isn't sensitive, so it also ships as a fallback
// default in config/appConfig.json. Setting DISCORD_CLIENT_ID as an env var
// (e.g. in Discloud) always overrides this default.
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || appConfig.clientId;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  console.error("Missing DISCORD_TOKEN or DISCORD_CLIENT_ID. Check your .env file.");
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
      ? Routes.applicationGuildCommands(DISCORD_CLIENT_ID, GUILD_ID)
      : Routes.applicationCommands(DISCORD_CLIENT_ID);

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
