const { EmbedBuilder } = require('discord.js');
const GuildConfig = require('../models/GuildConfig');

const goodbyeMessages = [
    '👋 {user} hat den Server verlassen',
    '😢 {user} ist gegangen...',
    '🚪 {user} hat das Gebäude verlassen',
    '✈️ {user} ist abgereist',
    '🌙 {user} hat sich verabschiedet',
    '💨 {user} ist verschwunden',
    '🎈 {user} ist weggeflogen',
    '🏃 {user} ist von dannen gezogen'
];

const goodbyeDescriptions = [
    'Wir werden dich vermissen! Komm gerne wieder vorbei.',
    'Schade, dass du gehst. Die Tür steht immer offen!',
    'Auf Wiedersehen! Wir hoffen, dich bald wiederzusehen.',
    'Bis bald! Du bist jederzeit willkommen zurückzukehren.',
    'Tschüss! Vielleicht sieht man sich ja wieder.',
    'Lebewohl! Wir wünschen dir alles Gute.',
    'Mach\'s gut! Die Community wird dich vermissen.'
];

module.exports = {
    name: 'guildMemberRemove',
    async execute(member, client) {
        // Versuche Config zu laden
        const config = await GuildConfig.findOne({ guildId: member.guild.id });
        
        // Wenn keine Config oder kein Kanal gesetzt, finde einen passenden Kanal
        let channel = null;
        
        if (config && config.leaveChannelId) {
            channel = member.guild.channels.cache.get(config.leaveChannelId);
        } else if (config && config.welcomeChannelId) {
            // Verwende Welcome-Channel als Fallback
            channel = member.guild.channels.cache.get(config.welcomeChannelId);
        } else {
            // Suche nach typischen Channels
            const channelNames = ['willkommen', 'welcome', 'begrüßung', 'general', 'allgemein', 'goodbye', 'tschüss'];
            channel = member.guild.channels.cache.find(ch => 
                ch.isTextBased() && channelNames.some(name => ch.name.toLowerCase().includes(name))
            );
        }
        
        if (!channel) return;

        // Wähle zufällige Nachricht
        const randomTitle = goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)]
            .replace('{user}', member.user.username);
        const randomDesc = goodbyeDescriptions[Math.floor(Math.random() * goodbyeDescriptions.length)];

        // Berechne wie lange das Mitglied auf dem Server war
        const joinedAt = member.joinedTimestamp;
        const timeOnServer = joinedAt ? `<t:${Math.floor(joinedAt / 1000)}:R>` : 'Unbekannt';

        const embed = new EmbedBuilder()
            .setColor('#ED4245')
            .setAuthor({ 
                name: randomTitle,
                iconURL: member.user.displayAvatarURL()
            })
            .setDescription(config?.leaveMessage || randomDesc)
            .addFields(
                { name: '👤 Username', value: member.user.tag, inline: true },
                { name: '📅 Beigetreten', value: timeOnServer, inline: true },
                { name: '📊 Verbleibende Mitglieder', value: `${member.guild.memberCount}`, inline: true }
            )
            .setFooter({ 
                text: member.guild.name, 
                iconURL: member.guild.iconURL() 
            })
            .setTimestamp();

        try {
            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Fehler beim Senden der Abschiedsnachricht:', error);
        }
    }
};
