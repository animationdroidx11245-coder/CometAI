const fs = require("fs");
const path = require("path");

const BAD_WORDS = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "config", "badwords.json"), "utf8"),
);

// Precompute whole-word regexes so "class" doesn't match "ass", etc.
const WORD_REGEXES = BAD_WORDS.map(
  (word) => new RegExp(`(?<![a-zA-Z])${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![a-zA-Z])`, "gi"),
);

/**
 * Simple intent classifier layered on top of the raw word match.
 * Looks at nearby tokens to guess whether the flagged word is likely
 * aimed at another person (harassing intent) vs. used generically
 * (e.g. venting, quoting, self-directed).
 */
const TARGET_PRONOUNS = /\b(you|u|ur|your|yourself|@)\b/i;
const SELF_PRONOUNS = /\b(i|im|i'm|me|myself|my)\b/i;

function classifyIntent(content, matchIndex, matchedWord) {
  const before = content.slice(Math.max(0, matchIndex - 20), matchIndex);
  const after = content.slice(
    matchIndex + matchedWord.length,
    matchIndex + matchedWord.length + 20,
  );
  const context = `${before} ${after}`;

  if (content.includes("<@") && TARGET_PRONOUNS.test(context) === false) {
    // A direct mention nearby strongly suggests the insult is targeted at someone.
    return "targeted";
  }
  if (TARGET_PRONOUNS.test(context)) return "targeted";
  if (SELF_PRONOUNS.test(context)) return "self-directed";
  return "general";
}

/**
 * Scans a message for configured bad words.
 * Returns null if clean, or a report describing every match found
 * plus a best-guess intent label for moderation context.
 */
function scanMessage(content) {
  const matches = [];

  for (const regex of WORD_REGEXES) {
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(content)) !== null) {
      matches.push({
        word: match[0],
        index: match.index,
        intent: classifyIntent(content, match.index, match[0]),
      });
    }
  }

  if (matches.length === 0) return null;

  // Escalate to "targeted" overall if any single match was targeted.
  const overallIntent = matches.some((m) => m.intent === "targeted")
    ? "targeted"
    : matches.some((m) => m.intent === "general")
      ? "general"
      : "self-directed";

  return {
    matches,
    overallIntent,
    words: [...new Set(matches.map((m) => m.word.toLowerCase()))],
  };
}

module.exports = { scanMessage };
