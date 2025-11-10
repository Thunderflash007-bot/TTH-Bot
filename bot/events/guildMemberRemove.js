const { EmbedBuilder } = require('discord.js');
const GuildConfig = require('../models/GuildConfig');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member, client) {
        const config = await GuildConfig.findOne({ guildId: member.guild.id });
        if (!config || !config.leaveChannelId) return;

        const channel = member.guild.channels.cache.get(config.leaveChannelId);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('👋 Auf Wiedersehen!')
            .setDescription(config.leaveMessage || `${member.user.tag} hat den Server verlassen.`)
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();

        channel.send({ embeds: [embed] });
    }
};
