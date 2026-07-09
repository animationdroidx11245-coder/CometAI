const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const { setGuildSettings } = require("../utils/storage");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setgoodbye")
    .setDescription("Configure the goodbye message shown when a member leaves.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel to send goodbye messages in")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription(
          "Goodbye message. Placeholders: {user} {username} {tag} {server} {memberCount}",
        )
        .setRequired(true),
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    const message = interaction.options.getString("message");

    setGuildSettings(interaction.guild.id, {
      goodbyeChannelId: channel.id,
      goodbyeMessage: message,
    });

    await interaction.reply({
      content: `Goodbye messages will now be sent in ${channel} with:\n> ${message}`,
      ephemeral: true,
    });
  },
};
