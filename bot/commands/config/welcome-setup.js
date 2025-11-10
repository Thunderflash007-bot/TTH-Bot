const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome-setup')
        .setDescription('Welcome-System konfigurieren')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Welcome-Channel')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Welcome-Nachricht (verwende {user} für Mention)')
                .setRequired(false)),
    
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const message = interaction.options.getString('message');

        let config = await GuildConfig.findOne({ guildId: interaction.guild.id });

        config.welcomeChannelId = channel.id;
        if (message) {
            config.welcomeMessage = message;
        }
        await GuildConfig.save(config);

        await interaction.reply({ 
            content: `✅ Welcome-System konfiguriert!\nChannel: ${channel}\nNachricht: ${message || 'Standard'}`, 
            ephemeral: true 
        });
    }
};
