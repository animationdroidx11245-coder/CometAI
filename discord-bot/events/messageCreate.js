const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { scanMessage } = require("../utils/badWordFilter");
const { addWarn, getWarns } = require("../utils/storage");
const { sendModLog } = require("../utils/moderation");

const INTENT_COLORS = {
  targeted: 0xe74c3c, // red - likely aimed at someone, treat seriously
  general: 0xf1c40f, // yellow - casual/general profanity
  "self-directed": 0x3498db, // blue - venting about self, lowest priority
};

module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    const report = scanMessage(message.content);
    if (!report) return;

    // Don't moderate members who can manage messages (mods/admins testing, etc.)
    const isStaff = message.member?.permissions?.has(PermissionFlagsBits.ModerateMembers);

    await message.delete().catch(() => {});

    if (!isStaff) {
      addWarn(message.guild.id, message.author.id, {
        moderatorId: message.client.user.id,
        reason: `Bad Word (auto-flagged, intent: ${report.overallIntent})`,
        timestamp: Date.now(),
      });
    }

    const totalWarns = getWarns(message.guild.id, message.author.id).length;

    const embed = new EmbedBuilder()
      .setTitle("Bad Word Detected")
      .setColor(INTENT_COLORS[report.overallIntent])
      .addFields(
        { name: "User", value: `${message.author.tag} (${message.author.id})`, inline: true },
        { name: "Channel", value: `${message.channel}`, inline: true },
        { name: "Intent", value: report.overallIntent, inline: true },
        { name: "Flagged word(s)", value: report.words.join(", ") },
        { name: "Original message", value: message.content.slice(0, 1000) || "(empty)" },
        { name: "Total Warnings", value: String(totalWarns), inline: true },
      )
      .setTimestamp();

    await sendModLog(message.guild, embed);

    message.channel
      .send({
        content: `${message.author}, please watch your language. This has been logged.`,
      })
      .then((msg) => setTimeout(() => msg.delete().catch(() => {}), 6000))
      .catch(() => {});
  },
};
