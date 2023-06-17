const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Botun tüm ping değerlerini sizinle paylaşır.'),
    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Hesaplanıyor...', fetchReply: true });
        await interaction.editReply(`:ping_pong: Pong!\n:stopwatch: Uptime: ${Math.round(interaction.client.uptime / 60000)} dakika\n:sparkling_heart: Websocket: ${interaction.client.ws.ping}ms.\n:round_pushpin: Rountrip Gecikmesi: ${sent.createdTimestamp - interaction.createdTimestamp}ms`);
    },
};