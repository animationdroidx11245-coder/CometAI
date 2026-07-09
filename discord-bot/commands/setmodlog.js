const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const { setGuildSettings } = require("../utils/storage");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setmodlog")
    .setDescription("Set the channel where moderation actions and bad word flags are logged.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel to send moderation logs in")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    setGuildSettings(interaction.guild.id, { modLogChannelId: channel.id });
    await interaction.reply({
      content: `Moderation logs will now be sent in ${channel}.`,
      ephemeral: true,
    });
  },
};
