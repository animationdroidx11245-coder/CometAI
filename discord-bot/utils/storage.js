const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const GUILDS_FILE = path.join(DATA_DIR, "guilds.json");
const WARNS_FILE = path.join(DATA_DIR, "warns.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson(filePath) {
  ensureDataDir();
  if (!fs.existsSync(filePath)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return raw.trim() ? JSON.parse(raw) : {};
  } catch (err) {
    console.error(`Failed to read ${filePath}:`, err);
    return {};
  }
}

function writeJson(filePath, data) {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

// ---- Guild settings (welcome/goodbye) ----

function getGuildSettings(guildId) {
  const all = readJson(GUILDS_FILE);
  return (
    all[guildId] || {
      welcomeChannelId: null,
      welcomeMessage: null,
      goodbyeChannelId: null,
      goodbyeMessage: null,
      modLogChannelId: null,
    }
  );
}

function setGuildSettings(guildId, partial) {
  const all = readJson(GUILDS_FILE);
  all[guildId] = { ...getGuildSettings(guildId), ...partial };
  writeJson(GUILDS_FILE, all);
  return all[guildId];
}

// ---- Warns ----

function getWarns(guildId, userId) {
  const all = readJson(WARNS_FILE);
  return (all[guildId] && all[guildId][userId]) || [];
}

function addWarn(guildId, userId, warn) {
  const all = readJson(WARNS_FILE);
  if (!all[guildId]) all[guildId] = {};
  if (!all[guildId][userId]) all[guildId][userId] = [];
  all[guildId][userId].push(warn);
  writeJson(WARNS_FILE, all);
  return all[guildId][userId];
}

function clearWarns(guildId, userId) {
  const all = readJson(WARNS_FILE);
  if (all[guildId]) {
    delete all[guildId][userId];
    writeJson(WARNS_FILE, all);
  }
}

module.exports = {
  getGuildSettings,
  setGuildSettings,
  getWarns,
  addWarn,
  clearWarns,
};
