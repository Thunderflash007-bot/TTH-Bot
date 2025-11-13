const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Melde einen User oder eine Nachricht')
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('Melde einen User')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('Der zu meldende User')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('grund')
                        .setDescription('Grund der Meldung')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('message')
                .setDescription('Melde eine Nachricht')
                .addStringOption(option =>
                    option.setName('message-id')
                        .setDescription('Die ID der Nachricht')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('grund')
                        .setDescription('Grund der Meldung')
                        .setRequired(true))),
    
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        const subcommand = interaction.options.getSubcommand();
        
        const reportsFile = path.join(__dirname, '../../../data/reports.json');
        let reports = [];
        if (fs.existsSync(reportsFile)) {
            reports = JSON.parse(fs.readFileSync(reportsFile, 'utf8'));
        }
        
        const report = {
            id: Date.now().toString(),
            guildId: interaction.guild.id,
            type: subcommand,
            reporterId: interaction.user.id,
            reason: interaction.options.getString('grund'),
            status: 'open',
            timestamp: new Date().toISOString()
        };
        
        if (subcommand === 'user') {
            const target = interaction.options.getUser('user');
            report.targetId = target.id;
            
            const embed = new EmbedBuilder()
                .setColor('#FEE75C')
                .setTitle('🚨 User-Meldung erhalten')
                .setDescription(`Vielen Dank für deine Meldung! Unser Team wird sich darum kümmern.`)
                .addFields(
                    { name: '👤 Gemeldeter User', value: `${target.tag}`, inline: true },
                    { name: '📝 Grund', value: report.reason, inline: false },
                    { name: '🆔 Report-ID', value: `\`${report.id}\``, inline: true }
                )
                .setTimestamp();
            
            await interaction.editReply({ embeds: [embed] });
            
        } else if (subcommand === 'message') {
            const messageId = interaction.options.getString('message-id');
            report.targetId = messageId;
            
            try {
                const message = await interaction.channel.messages.fetch(messageId);
                report.evidence = {
                    content: message.content,
                    authorId: message.author.id,
                    channelId: message.channel.id
                };
            } catch (error) {
                // Nachricht nicht gefunden
            }
            
            const embed = new EmbedBuilder()
                .setColor('#FEE75C')
                .setTitle('🚨 Nachrichten-Meldung erhalten')
                .setDescription(`Vielen Dank für deine Meldung! Unser Team wird sich darum kümmern.`)
                .addFields(
                    { name: '📝 Grund', value: report.reason, inline: false },
                    { name: '🆔 Report-ID', value: `\`${report.id}\``, inline: true }
                )
                .setTimestamp();
            
            await interaction.editReply({ embeds: [embed] });
        }
        
        reports.push(report);
        fs.writeFileSync(reportsFile, JSON.stringify(reports, null, 2));
        
        // Benachrichtige Mods im Log-Channel
        const GuildConfig = require('../../models/GuildConfig');
        const config = GuildConfig.findOne({ guildId: interaction.guild.id });
        
        if (config && config.logChannelId) {
            try {
                const logChannel = await interaction.guild.channels.fetch(config.logChannelId);
                
                const logEmbed = new EmbedBuilder()
                    .setColor('#ED4245')
                    .setTitle('🚨 Neue Meldung')
                    .addFields(
                        { name: '📊 Typ', value: subcommand === 'user' ? 'User-Meldung' : 'Nachrichten-Meldung', inline: true },
                        { name: '👤 Reporter', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                        { name: '📝 Grund', value: report.reason, inline: false },
                        { name: '🆔 Report-ID', value: `\`${report.id}\``, inline: true }
                    )
                    .setTimestamp();
                
                if (subcommand === 'user') {
                    const target = interaction.options.getUser('user');
                    logEmbed.addFields({ name: '🎯 Ziel', value: `${target.tag} (${target.id})`, inline: false });
                }
                
                await logChannel.send({ embeds: [logEmbed] });
            } catch (error) {
                console.error('Fehler beim Senden der Log-Nachricht:', error);
            }
        }
    }
};
