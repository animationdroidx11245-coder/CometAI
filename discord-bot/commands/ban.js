const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { sendModLog, baseModerationEmbed } = require("../utils/moderation");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a member from the server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((option) =>
      option.setName("user").setDescription("Member to ban").setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Reason for the ban").setRequired(false),
    )
    .addIntegerOption((option) =>
      option
        .setName("delete_message_days")
        .setDescription("Days of messages to delete (0-7)")
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false),
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "No reason provided";
    const deleteDays = interaction.options.getInteger("delete_message_days") || 0;

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (member && !member.bannable) {
      await interaction.reply({
        content: "I don't have permission to ban that member (check role hierarchy).",
        ephemeral: true,
      });
      return;
    }

    await targetUser
      .send(`You were banned from **${interaction.guild.name}**.\nReason: ${reason}`)
      .catch(() => {});

    await interaction.guild.members.ban(targetUser.id, {
      reason,
      deleteMessageSeconds: deleteDays * 86400,
    });

    const embed = baseModerationEmbed({
      action: "Member Banned",
      target: targetUser,
      moderator: interaction.user,
      reason,
      color: 0xe74c3c,
    });

    await interaction.reply({ embeds: [embed] });
    await sendModLog(interaction.guild, embed);
  },
};
