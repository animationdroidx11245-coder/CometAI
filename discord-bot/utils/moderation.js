const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { getGuildSettings } = require("./storage");

/**
 * Sends a log embed to the configured mod-log channel, if one is set.
 */
async function sendModLog(guild, embed) {
  const settings = getGuildSettings(guild.id);
  if (!settings.modLogChannelId) return;
  try {
    const channel = await guild.channels.fetch(settings.modLogChannelId);
    if (channel && channel.isTextBased()) {
      await channel.send({ embeds: [embed] });
    }
  } catch (err) {
    console.error("Failed to send mod log:", err);
  }
}

function baseModerationEmbed({ action, target, moderator, reason, color }) {
  return new EmbedBuilder()
    .setTitle(action)
    .setColor(color)
    .addFields(
      { name: "User", value: `${target.tag || target.username} (${target.id})`, inline: true },
      { name: "Moderator", value: `${moderator.tag || moderator.username}`, inline: true },
      { name: "Reason", value: reason || "No reason provided" },
    )
    .setTimestamp();
}

function memberHasPermission(interaction, permission) {
  return interaction.memberPermissions?.has(permission);
}

module.exports = {
  sendModLog,
  baseModerationEmbed,
  memberHasPermission,
  PermissionFlagsBits,
};
