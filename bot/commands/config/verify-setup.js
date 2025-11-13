const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify-setup')
        .setDescription('Richtet das Verifizierungs-System ein')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('passcode')
                .setDescription('Passcode für die Verifizierung')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('rolle')
                .setDescription('Rolle die nach Verifizierung gegeben wird')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel für Verifizierungen')
                .setRequired(false)),
    
    async execute(interaction) {
        const passcode = interaction.options.getString('passcode');
        const role = interaction.options.getRole('rolle');
        const channel = interaction.options.getChannel('channel');
        
        let config = GuildConfig.findOne({ guildId: interaction.guild.id });
        if (!config) {
            config = GuildConfig.create(interaction.guild.id);
        }
        
        config.verificationPasscode = passcode;
        config.verificationRoleId = role.id;
        if (channel) config.verificationChannelId = channel.id;
        
        GuildConfig.save(config);
        
        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('✅ Verifizierungs-System eingerichtet')
            .addFields(
                { name: '🔑 Passcode', value: `\`${passcode}\``, inline: true },
                { name: '🎭 Rolle', value: role.toString(), inline: true }
            )
            .setFooter({ text: 'User können sich jetzt mit /verify verifizieren' });
        
        await interaction.reply({ embeds: [embed] });
    }
};
