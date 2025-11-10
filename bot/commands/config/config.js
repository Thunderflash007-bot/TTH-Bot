const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Server-Konfiguration verwalten')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('ticket-category')
                .setDescription('Ticket-Kategorie festlegen')
                .addChannelOption(option =>
                    option.setName('category')
                        .setDescription('Die Kategorie für Tickets')
                        .addChannelTypes(ChannelType.GuildCategory)
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('application-channel')
                .setDescription('Bewerbungs-Channel festlegen')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Channel für Bewerbungen')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('log-channel')
                .setDescription('Log-Channel festlegen')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Channel für Logs')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('Aktuelle Konfiguration anzeigen')),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        let config = await GuildConfig.findOne({ guildId: interaction.guild.id });

        if (subcommand === 'ticket-category') {
            const category = interaction.options.getChannel('category');
            config.ticketCategoryId = category.id;
            await GuildConfig.save(config);

            return interaction.reply({ 
                content: `✅ Ticket-Kategorie wurde auf ${category} gesetzt!`, 
                ephemeral: true 
            });
        }

        if (subcommand === 'application-channel') {
            const channel = interaction.options.getChannel('channel');
            config.applicationChannelId = channel.id;
            await GuildConfig.save(config);

            return interaction.reply({ 
                content: `✅ Bewerbungs-Channel wurde auf ${channel} gesetzt!`, 
                ephemeral: true 
            });
        }

        if (subcommand === 'log-channel') {
            const channel = interaction.options.getChannel('channel');
            config.logChannelId = channel.id;
            await GuildConfig.save(config);

            return interaction.reply({ 
                content: `✅ Log-Channel wurde auf ${channel} gesetzt!`, 
                ephemeral: true 
            });
        }

        if (subcommand === 'view') {
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('⚙️ Server-Konfiguration')
                .addFields(
                    { 
                        name: '🎫 Ticket-Kategorie', 
                        value: config.ticketCategoryId ? `<#${config.ticketCategoryId}>` : 'Nicht gesetzt', 
                        inline: true 
                    },
                    { 
                        name: '📋 Bewerbungs-Channel', 
                        value: config.applicationChannelId ? `<#${config.applicationChannelId}>` : 'Nicht gesetzt', 
                        inline: true 
                    },
                    { 
                        name: '📜 Log-Channel', 
                        value: config.logChannelId ? `<#${config.logChannelId}>` : 'Nicht gesetzt', 
                        inline: true 
                    },
                    { 
                        name: '👋 Welcome-Channel', 
                        value: config.welcomeChannelId ? `<#${config.welcomeChannelId}>` : 'Nicht gesetzt', 
                        inline: true 
                    },
                    { 
                        name: '👋 Leave-Channel', 
                        value: config.leaveChannelId ? `<#${config.leaveChannelId}>` : 'Nicht gesetzt', 
                        inline: true 
                    }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
