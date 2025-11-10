const { EmbedBuilder } = require('discord.js');
const GuildConfig = require('../models/GuildConfig');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        const config = await GuildConfig.findOne({ guildId: member.guild.id });
        if (!config || !config.welcomeChannelId) return;

        const channel = member.guild.channels.cache.get(config.welcomeChannelId);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('👋 Willkommen!')
            .setDescription(config.welcomeMessage || `Willkommen auf dem Server, ${member}!`)
            .setThumbnail(member.user.displayAvatarURL())
            .setFooter({ text: `Mitglied #${member.guild.memberCount}` })
            .setTimestamp();

        channel.send({ embeds: [embed] });
    }
};
