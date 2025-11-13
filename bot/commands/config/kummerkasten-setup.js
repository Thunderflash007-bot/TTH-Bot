const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kummerkasten-setup')
        .setDescription('Richtet den Kummerkasten (anonymer Chat) ein')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel für Kummerkasten-Threads')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('supporter-rolle')
                .setDescription('Rolle die Kummerkasten-Anfragen sehen kann')
                .setRequired(true)),
    
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const supporterRole = interaction.options.getRole('supporter-rolle');
        
        let config = GuildConfig.findOne({ guildId: interaction.guild.id });
        if (!config) {
            config = GuildConfig.create(interaction.guild.id);
        }
        
        config.kummerkastenChannelId = channel.id;
        config.kummerkastenSupportRoleId = supporterRole.id;
        
        GuildConfig.save(config);
        
        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('✅ Kummerkasten eingerichtet')
            .setDescription('User können jetzt anonyme Nachrichten über `/kummerkasten` senden.')
            .addFields(
                { name: '📬 Channel', value: channel.toString(), inline: true },
                { name: '👥 Supporter', value: supporterRole.toString(), inline: true }
            );
        
        await interaction.reply({ embeds: [embed] });
    }
};
