const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { sendModLog, baseModerationEmbed } = require("../utils/moderation");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((option) =>
      option.setName("user").setDescription("Member to kick").setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Reason for the kick").setRequired(false),
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "No reason provided";

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) {
      await interaction.reply({ content: "That user is not in this server.", ephemeral: true });
      return;
    }
    if (!member.kickable) {
      await interaction.reply({
        content: "I don't have permission to kick that member (check role hierarchy).",
        ephemeral: true,
      });
      return;
    }

    await targetUser
      .send(`You were kicked from **${interaction.guild.name}**.\nReason: ${reason}`)
      .catch(() => {});

    await member.kick(reason);

    const embed = baseModerationEmbed({
      action: "Member Kicked",
      target: targetUser,
      moderator: interaction.user,
      reason,
      color: 0xe67e22,
    });

    await interaction.reply({ embeds: [embed] });
    await sendModLog(interaction.guild, embed);
  },
};
