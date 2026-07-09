const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { getGuildSettings } = require("../utils/storage");
const { applyPlaceholders } = require("../utils/placeholders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Preview the welcome or goodbye message in this server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Which message to test")
        .setRequired(true)
        .addChoices(
          { name: "welcome", value: "welcome" },
          { name: "goodbye", value: "goodbye" },
        ),
    ),

  async execute(interaction) {
    const type = interaction.options.getString("type");
    const settings = getGuildSettings(interaction.guild.id);
    const member = interaction.member;

    const channelId = type === "welcome" ? settings.welcomeChannelId : settings.goodbyeChannelId;
    const template = type === "welcome" ? settings.welcomeMessage : settings.goodbyeMessage;

    if (!channelId || !template) {
      await interaction.reply({
        content: `No ${type} message is configured yet. Use /set${type} first.`,
        ephemeral: true,
      });
      return;
    }

    const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
    if (!channel || !channel.isTextBased()) {
      await interaction.reply({
        content: `The configured ${type} channel no longer exists. Please reconfigure it with /set${type}.`,
        ephemeral: true,
      });
      return;
    }

    const rendered = applyPlaceholders(template, member);
    await channel.send(`**[TEST ${type.toUpperCase()}]** ${rendered}`);

    await interaction.reply({
      content: `Sent a test ${type} message in ${channel}.`,
      ephemeral: true,
    });
  },
};
