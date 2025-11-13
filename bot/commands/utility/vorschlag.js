const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vorschlag')
        .setDescription('Mache einen Vorschlag')
        .addStringOption(option =>
            option.setName('titel')
                .setDescription('Titel des Vorschlags')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('beschreibung')
                .setDescription('Beschreibung des Vorschlags')
                .setRequired(true)),
    
    async execute(interaction) {
        const title = interaction.options.getString('titel');
        const description = interaction.options.getString('beschreibung');
        
        const GuildConfig = require('../../models/GuildConfig');
        const config = GuildConfig.findOne({ guildId: interaction.guild.id });
        
        // Finde Vorschläge-Channel
        let suggestionsChannel = interaction.guild.channels.cache.find(
            c => c.name === 'vorschläge' || c.name === '💡vorschläge' || c.name === 'suggestions'
        );
        
        if (!suggestionsChannel) {
            return await interaction.reply({ 
                content: '❌ Kein Vorschläge-Channel gefunden! Erstelle einen Channel namens `vorschläge`.',
                ephemeral: true 
            });
        }
        
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setAuthor({ 
                name: `Vorschlag von ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTitle(`💡 ${title}`)
            .setDescription(description)
            .setFooter({ text: `User-ID: ${interaction.user.id}` })
            .setTimestamp();
        
        const message = await suggestionsChannel.send({ embeds: [embed] });
        
        // Erstelle Thread
        const thread = await message.startThread({
            name: title.slice(0, 100), // Max 100 Zeichen
            autoArchiveDuration: 1440 // 24 Stunden
        });
        
        // Reaktionen hinzufügen
        await message.react('👍');
        await message.react('👎');
        await message.react('🤷');
        
        const confirmEmbed = new EmbedBuilder()
            .setColor('#57F287')
            .setDescription(`✅ Dein Vorschlag wurde in ${suggestionsChannel} gepostet!\n\nLink: ${message.url}`);
        
        await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
    }
};
