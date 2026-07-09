/**
 * Replaces placeholders in welcome/goodbye messages with real values.
 * Supported placeholders:
 *   {user}        -> @mention of the member
 *   {username}    -> member's display name
 *   {tag}         -> member's full tag (name#0000 or name)
 *   {server}      -> guild name
 *   {memberCount} -> current member count of the guild
 */
function applyPlaceholders(template, member) {
  if (!template) return template;
  return template
    .replaceAll("{user}", `<@${member.id}>`)
    .replaceAll("{username}", member.user.username)
    .replaceAll("{tag}", member.user.tag || member.user.username)
    .replaceAll("{server}", member.guild.name)
    .replaceAll("{memberCount}", String(member.guild.memberCount));
}

module.exports = { applyPlaceholders };
