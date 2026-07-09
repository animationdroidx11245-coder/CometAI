const { getGuildSettings } = require("../utils/storage");
const { applyPlaceholders } = require("../utils/placeholders");

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    const settings = getGuildSettings(member.guild.id);
    if (!settings.welcomeChannelId || !settings.welcomeMessage) return;

    const channel = await member.guild.channels.fetch(settings.welcomeChannelId).catch(() => null);
    if (!channel || !channel.isTextBased()) return;

    const rendered = applyPlaceholders(settings.welcomeMessage, member);
    await channel.send(rendered).catch((err) => console.error("Failed to send welcome message:", err));
  },
};
