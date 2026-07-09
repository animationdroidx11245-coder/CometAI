# Mod & Welcome Discord Bot

A Node.js Discord bot (discord.js v14) with:

- **Welcome / Goodbye messages** — configurable per server
  - `/setwelcome channel message` — set the welcome channel + message
  - `/setgoodbye channel message` — set the goodbye channel + message
  - `/test type:welcome|goodbye` — sends a live test of the configured message
- **Bad word detection** — scans every message, flags matches with a guessed **intent** (`targeted`, `general`, `self-directed`), deletes the message, auto-warns the author, and logs it to your mod-log channel
- **Moderation commands**
  - `/warn user reason` — warn a member (DMs them, tracks a running total)
  - `/kick user reason` — kick a member
  - `/ban user reason [delete_message_days]` — ban a member
  - `/mute user minutes reason` — timeout (mute) a member
  - `/warnings user [clear]` — view or clear a member's warning history
  - `/setmodlog channel` — set where moderation + bad-word logs are posted

All commands are registered as **slash commands**, so they show up in each server's built-in command list/autocomplete automatically once deployed.

## Setup

1. Create an application + bot at https://discord.com/developers/applications, copy its **Token** and **Application (Client) ID**.
2. Under **Bot**, enable these **Privileged Gateway Intents**: `SERVER MEMBERS INTENT` and `MESSAGE CONTENT INTENT`.
3. Invite the bot to your server with the `bot` and `applications.commands` scopes, and these permissions: Manage Messages, Kick Members, Ban Members, Moderate Members, Send Messages, Read Message History.
4. Install dependencies:
   ```
   npm install
   ```
5. Copy `.env.example` to `.env` and fill in `DISCORD_TOKEN` and `CLIENT_ID` (add `GUILD_ID` too if you want commands to appear instantly in one test server while developing).
6. Register the slash commands:
   ```
   npm run deploy
   ```
7. Start the bot:
   ```
   npm start
   ```

## Deploying to Discloud

This project includes a `discloud.config` file already set up for a Node.js bot.

1. Zip the **contents** of this folder (or use the provided zip) — do not include `node_modules` or `.env`, Discloud installs dependencies itself.
2. On the [Discloud dashboard/bot](https://discloud.com), upload the zip to create your app.
3. In the Discloud panel, set the environment variables `DISCORD_TOKEN` and `CLIENT_ID` (and `GUILD_ID` if used) under your app's settings — do not commit real tokens into the zip.
4. After the app is running, run `node deploy-commands.js` once (via the Discloud terminal, or locally against the same bot) so your slash commands register with Discord.

## Configuration notes

- **Bad word list**: edit `config/badwords.json` to add/remove flagged words.
- **Placeholders** available in welcome/goodbye messages: `{user}`, `{username}`, `{tag}`, `{server}`, `{memberCount}`.
- **Storage**: settings and warnings are stored as JSON files under `data/`. This is fine for small/medium servers; for heavier use, swap `utils/storage.js` for a real database.
- Members with the **Moderate Members** permission are exempt from the automatic bad-word warning (but their message is still deleted) so mods/admins aren't auto-warned while testing.
