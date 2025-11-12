const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Zeigt Informationen über den Server'),
    
    async execute(interaction) {
        const guild = interaction.guild;

        // Channel-Statistiken
        const channels = guild.channels.cache;
        const textChannels = channels.filter(c => c.type === 0).size;
        const voiceChannels = channels.filter(c => c.type === 2).size;
        const categories = channels.filter(c => c.type === 4).size;
        
        // Member-Statistiken
        await guild.members.fetch();
        const members = guild.members.cache;
        const humans = members.filter(m => !m.user.bot).size;
        const bots = members.filter(m => m.user.bot).size;
        const onlineMembers = members.filter(m => m.presence?.status !== 'offline').size;

        // Boost-Informationen
        const boostTier = guild.premiumTier;
        const boostEmojis = ['', '⭐', '⭐⭐', '⭐⭐⭐'];
        const boostInfo = `${guild.premiumSubscriptionCount || 0} Boosts ${boostEmojis[boostTier]}`;

        // Verifizierungslevel
        const verificationLevels = {
            0: '🔓 Keine',
            1: '📧 Niedrig - Email verifiziert',
            2: '📝 Mittel - 5+ Minuten auf Discord',
            3: '🔒 Hoch - 10+ Minuten im Server',
            4: '🛡️ Sehr Hoch - Telefon verifiziert'
        };

        const embed = new EmbedBuilder()
            .setColor(guild.members.me.displayHexColor || '#5865F2')
            .setAuthor({ 
                name: guild.name,
                iconURL: guild.iconURL({ size: 512 })
            })
            .setThumbnail(guild.iconURL({ size: 512 }))
            .setDescription(guild.description || '*Keine Beschreibung*')
            .addFields(
                { name: '👑 Server-Besitzer', value: `<@${guild.ownerId}>`, inline: true },
                { name: '🆔 Server-ID', value: `\`${guild.id}\``, inline: true },
                { name: '📅 Erstellt am', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>\n<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
                { name: `👥 Mitglieder [${guild.memberCount}]`, value: `👤 Menschen: **${humans}**\n🤖 Bots: **${bots}**\n🟢 Online: **${onlineMembers}**`, inline: true },
                { name: `💬 Channels [${channels.size}]`, value: `📝 Text: **${textChannels}**\n🔊 Voice: **${voiceChannels}**\n📁 Kategorien: **${categories}**`, inline: true },
                { name: '🎭 Rollen', value: `**${guild.roles.cache.size}** Rollen`, inline: true },
                { name: '😊 Emojis & Sticker', value: `😊 Emojis: **${guild.emojis.cache.size}**\n🎨 Sticker: **${guild.stickers.cache.size}**`, inline: true },
                { name: '🚀 Server-Boost', value: boostInfo + `\nTier: **${boostTier}**`, inline: true },
                { name: '🛡️ Verifizierungslevel', value: verificationLevels[guild.verificationLevel], inline: true }
            )
            .setFooter({ text: `Abgefragt von ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        if (guild.bannerURL()) {
            embed.setImage(guild.bannerURL({ size: 1024 }));
        }

        await interaction.reply({ embeds: [embed] });
    }
};
