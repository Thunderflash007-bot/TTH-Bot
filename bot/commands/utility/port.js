const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('port')
        .setDescription('Port-Verwaltung')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Fügt einen Port hinzu')
                .addIntegerOption(option =>
                    option.setName('port')
                        .setDescription('Port-Nummer')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(65535))
                .addStringOption(option =>
                    option.setName('beschreibung')
                        .setDescription('Wofür wird der Port verwendet?')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('ip')
                        .setDescription('IP-Adresse (optional)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Entfernt einen Port')
                .addIntegerOption(option =>
                    option.setName('port')
                        .setDescription('Port-Nummer')
                        .setRequired(true))),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const GuildConfig = require('../../models/GuildConfig');
        
        await interaction.deferReply();
        
        if (subcommand === 'add') {
            const port = interaction.options.getInteger('port');
            const description = interaction.options.getString('beschreibung');
            const ip = interaction.options.getString('ip') || interaction.guild.name;
            
            // Finde #ports Channel
            const portsChannel = interaction.guild.channels.cache.find(c => c.name === 'ports' || c.name === '🔌ports');
            
            if (!portsChannel) {
                return await interaction.editReply({ content: '❌ Kein `#ports` Channel gefunden! Bitte erstelle zuerst einen Channel namens `ports`.' });
            }
            
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(`🔌 Port ${port}`)
                .setDescription(description)
                .addFields(
                    { name: '📊 Port', value: `\`${port}\``, inline: true },
                    { name: '🌐 IP', value: `\`${ip}\``, inline: true },
                    { name: '👤 Hinzugefügt von', value: interaction.user.tag, inline: true }
                )
                .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
                .setTimestamp();
            
            await portsChannel.send({ embeds: [embed] });
            
            const confirmEmbed = new EmbedBuilder()
                .setColor('#57F287')
                .setDescription(`✅ Port **${port}** wurde in ${portsChannel} hinzugefügt!`);
            
            await interaction.editReply({ embeds: [confirmEmbed] });
            
        } else if (subcommand === 'remove') {
            const port = interaction.options.getInteger('port');
            
            const portsChannel = interaction.guild.channels.cache.find(c => c.name === 'ports' || c.name === '🔌ports');
            
            if (!portsChannel) {
                return await interaction.editReply({ content: '❌ Kein `#ports` Channel gefunden!' });
            }
            
            // Suche nach Port-Embed
            const messages = await portsChannel.messages.fetch({ limit: 50 });
            const portMessage = messages.find(m => 
                m.embeds.length > 0 && 
                m.embeds[0].title === `🔌 Port ${port}`
            );
            
            if (portMessage) {
                await portMessage.delete();
                
                const embed = new EmbedBuilder()
                    .setColor('#57F287')
                    .setDescription(`✅ Port **${port}** wurde entfernt!`);
                
                await interaction.editReply({ embeds: [embed] });
            } else {
                await interaction.editReply({ content: `❌ Port **${port}** nicht gefunden!` });
            }
        }
    }
};
