const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { getWarns, clearWarns } = require("../utils/storage");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("View or clear a member's warnings.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) =>
      option.setName("user").setDescription("Member to check").setRequired(true),
    )
    .addBooleanOption((option) =>
      option.setName("clear").setDescription("Clear all warnings for this member").setRequired(false),
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user");
    const clear = interaction.options.getBoolean("clear") || false;

    if (clear) {
      clearWarns(interaction.guild.id, targetUser.id);
      await interaction.reply({
        content: `Cleared all warnings for ${targetUser.tag}.`,
        ephemeral: true,
      });
      return;
    }

    const warns = getWarns(interaction.guild.id, targetUser.id);
    if (warns.length === 0) {
      await interaction.reply({
        content: `${targetUser.tag} has no warnings.`,
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`Warnings for ${targetUser.tag}`)
      .setColor(0xf1c40f)
      .setDescription(
        warns
          .map(
            (w, i) =>
              `**${i + 1}.** ${w.reason} — <t:${Math.floor(w.timestamp / 1000)}:R> (by <@${w.moderatorId}>)`,
          )
          .join("\n"),
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
