const { getGuildSettings } = require("../utils/storage");
const { applyPlaceholders } = require("../utils/placeholders");

module.exports = {
  name: "guildMemberRemove",
  async execute(member) {
    const settings = getGuildSettings(member.guild.id);
    if (!settings.goodbyeChannelId || !settings.goodbyeMessage) return;

    const channel = await member.guild.channels.fetch(settings.goodbyeChannelId).catch(() => null);
    if (!channel || !channel.isTextBased()) return;

    const rendered = applyPlaceholders(settings.goodbyeMessage, member);
    await channel.send(rendered).catch((err) => console.error("Failed to send goodbye message:", err));
  },
};
