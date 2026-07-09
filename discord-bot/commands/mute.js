const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { sendModLog, baseModerationEmbed } = require("../utils/moderation");

const MAX_TIMEOUT_MS = 28 * 24 * 60 * 60 * 1000; // Discord's hard cap: 28 days

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Timeout (mute) a member for a set number of minutes.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) =>
      option.setName("user").setDescription("Member to mute").setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("minutes")
        .setDescription("Mute duration in minutes (default 10, max 40320)")
        .setMinValue(1)
        .setMaxValue(40320)
        .setRequired(false),
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Reason for the mute").setRequired(false),
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user");
    const minutes = interaction.options.getInteger("minutes") || 10;
    const reason = interaction.options.getString("reason") || "No reason provided";

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) {
      await interaction.reply({ content: "That user is not in this server.", ephemeral: true });
      return;
    }
    if (!member.moderatable) {
      await interaction.reply({
        content: "I don't have permission to mute that member (check role hierarchy).",
        ephemeral: true,
      });
      return;
    }

    const durationMs = Math.min(minutes * 60 * 1000, MAX_TIMEOUT_MS);
    await member.timeout(durationMs, reason);

    const embed = baseModerationEmbed({
      action: "Member Muted",
      target: targetUser,
      moderator: interaction.user,
      reason,
      color: 0x9b59b6,
    }).addFields({ name: "Duration", value: `${minutes} minute(s)`, inline: true });

    await interaction.reply({ embeds: [embed] });
    await sendModLog(interaction.guild, embed);

    await targetUser
      .send(
        `You were muted in **${interaction.guild.name}** for ${minutes} minute(s).\nReason: ${reason}`,
      )
      .catch(() => {});
  },
};
