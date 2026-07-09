const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const { setGuildSettings } = require("../utils/storage");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setwelcome")
    .setDescription("Configure the welcome message shown when a member joins.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel to send welcome messages in")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription(
          "Welcome message. Placeholders: {user} {username} {tag} {server} {memberCount}",
        )
        .setRequired(true),
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    const message = interaction.options.getString("message");

    setGuildSettings(interaction.guild.id, {
      welcomeChannelId: channel.id,
      welcomeMessage: message,
    });

    await interaction.reply({
      content: `Welcome messages will now be sent in ${channel} with:\n> ${message}`,
      ephemeral: true,
    });
  },
};
