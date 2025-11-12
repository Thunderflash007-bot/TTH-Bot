const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-tickets')
        .setDescription('Erstellt das Ticket-System')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('category')
                .setDescription('Die Kategorie für die Tickets')
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('support-role')
                .setDescription('Die Support-Rolle')
                .setRequired(false)),
    
    async execute(interaction) {
        const category = interaction.options.getChannel('category');
        const supportRole = interaction.options.getRole('support-role');

        // Speichere Config wenn angegeben
        if (category || supportRole) {
            let config = await GuildConfig.findOne({ guildId: interaction.guild.id });
            if (!config) {
                config = {
                    guildId: interaction.guild.id
                };
            }
            if (category) config.ticketCategoryId = category.id;
            if (supportRole) config.supportRoleId = supportRole.id;
            await GuildConfig.save(config);
        }

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setAuthor({ 
                name: 'Ticket & Support System',
                iconURL: interaction.guild.iconURL()
            })
            .setDescription('Brauchst du Hilfe oder hast eine Frage?\n\nKlicke auf **🎫 Ticket erstellen** um ein privates Ticket zu öffnen.\nUnser Support-Team wird sich schnellstmöglich um dein Anliegen kümmern!')
            .addFields(
                { name: '📋 Verfügbare Kategorien', value: '• **Support** - Allgemeine Fragen\n• **Bug Report** - Fehler melden\n• **Bewerbung** - Für das Team bewerben\n• **Sonstiges** - Andere Anliegen', inline: false },
                { name: '⚡ Schnelle Antworten', value: 'Unser Team antwortet in der Regel innerhalb von 24 Stunden.', inline: false }
            )
            .setThumbnail(interaction.guild.iconURL({ size: 256 }))
            .setImage('https://i.imgur.com/AfFp7pu.png')
            .setFooter({ text: `${interaction.guild.name} • Ticket System`, iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_open')
                    .setLabel('Ticket erstellen')
                    .setEmoji('�')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('application_open')
                    .setLabel('Bewerbung')
                    .setEmoji('�')
                    .setStyle(ButtonStyle.Success)
            );

        await interaction.channel.send({ embeds: [embed], components: [row] });
        
        const successEmbed = new EmbedBuilder()
            .setColor('#57F287')
            .setDescription('✅ **Ticket-System erfolgreich eingerichtet!**\n\n' + 
                (category ? `📁 Kategorie: ${category}\n` : '') +
                (supportRole ? `👥 Support-Rolle: ${supportRole}\n` : ''))
            .setTimestamp();
            
        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    }
};
