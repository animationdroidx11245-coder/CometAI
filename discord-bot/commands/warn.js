const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { addWarn, getWarns } = require("../utils/storage");
const { sendModLog, baseModerationEmbed } = require("../utils/moderation");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a member.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) =>
      option.setName("user").setDescription("Member to warn").setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Reason for the warning").setRequired(false),
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "No reason provided";

    addWarn(interaction.guild.id, targetUser.id, {
      moderatorId: interaction.user.id,
      reason,
      timestamp: Date.now(),
    });

    const totalWarns = getWarns(interaction.guild.id, targetUser.id).length;

    const embed = baseModerationEmbed({
      action: "Member Warned",
      target: targetUser,
      moderator: interaction.user,
      reason,
      color: 0xf1c40f,
    }).addFields({ name: "Total Warnings", value: String(totalWarns), inline: true });

    await interaction.reply({ embeds: [embed] });
    await sendModLog(interaction.guild, embed);

    await targetUser
      .send(
        `You were warned in **${interaction.guild.name}**.\nReason: ${reason}\nTotal warnings: ${totalWarns}`,
      )
      .catch(() => {});
  },
};
