const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const GuildConfig = require('../models/GuildConfig');

const welcomeMessages = [
    '🎉 Ein wildes {user} ist erschienen!',
    '👋 Hey {user}, schön dass du da bist!',
    '🌟 {user} ist dem Server beigetreten!',
    '🎊 Willkommen {user}! Die Party kann beginnen!',
    '✨ {user} hat das Level betreten!',
    '🚀 {user} ist gelandet!',
    '🎮 Player {user} hat das Spiel betreten!',
    '🎯 {user} hat uns gefunden!',
    '⭐ Ein neuer Star ist geboren: {user}!',
    '🎪 Manege frei für {user}!'
];

const welcomeDescriptions = [
    'Wir freuen uns, dich in unserer Community zu haben! Schau dich gerne um und fühle dich wie zu Hause.',
    'Herzlich willkommen! Vergiss nicht, dir die Regeln anzuschauen und hab eine tolle Zeit!',
    'Schön, dass du zu uns gefunden hast! Viel Spaß auf dem Server!',
    'Willkommen in unserer Community! Wir hoffen, du hast eine großartige Zeit hier.',
    'Hey! Toll, dass du da bist. Bei Fragen stehen wir dir gerne zur Verfügung!',
    'Willkommen an Bord! Mach es dir gemütlich und lerne neue Leute kennen.',
    'Ein neues Mitglied! Wir wünschen dir viel Spaß und tolle Erlebnisse hier.',
    'Herzlich willkommen! Schau dich um und werde Teil unserer Community!'
];

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        // Versuche Config zu laden
        const config = await GuildConfig.findOne({ guildId: member.guild.id });
        
        // Wenn keine Config oder kein Kanal gesetzt, finde einen passenden Kanal
        let channel = null;
        
        if (config && config.welcomeChannelId) {
            channel = member.guild.channels.cache.get(config.welcomeChannelId);
        } else {
            // Suche nach typischen Welcome-Channel-Namen
            const channelNames = ['willkommen', 'welcome', 'begrüßung', 'general', 'allgemein'];
            channel = member.guild.channels.cache.find(ch => 
                ch.isTextBased() && channelNames.some(name => ch.name.toLowerCase().includes(name))
            );
        }
        
        if (!channel) return;

        // Wähle zufällige Nachricht
        const randomTitle = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
            .replace('{user}', member.user.username);
        const randomDesc = welcomeDescriptions[Math.floor(Math.random() * welcomeDescriptions.length)];

        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setAuthor({ 
                name: randomTitle,
                iconURL: member.user.displayAvatarURL()
            })
            .setDescription(`${member}\n\n${config?.welcomeMessage || randomDesc}`)
            .addFields(
                { name: '👤 Account erstellt', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '📊 Mitglied', value: `#${member.guild.memberCount}`, inline: true }
            )
            .setFooter({ 
                text: `${member.guild.name} • Viel Spaß!`, 
                iconURL: member.guild.iconURL() 
            })
            .setTimestamp();

        try {
            await channel.send({ 
                content: `🎉 ${member}`,
                embeds: [embed] 
            });
        } catch (error) {
            console.error('Fehler beim Senden der Willkommensnachricht:', error);
        }

        // Auto-Role Handler aufrufen
        if (client.autoRoleHandler) {
            await client.autoRoleHandler.handleMemberJoin(member);
        }
    }
};
