module.exports = {
  name: "clientReady",
  once: true,
  execute(client) {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity("for bad words | /warn /kick /ban /mute", { type: 3 }); // WATCHING
  },
};
