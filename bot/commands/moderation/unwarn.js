const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Warning = require('../../models/Warning');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unwarn')
        .setDescription('Entfernt eine Warnung')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addStringOption(option =>
            option.setName('warn-id')
                .setDescription('Die ID der Warnung')
                .setRequired(true)),
    
    async execute(interaction) {
        const warnId = interaction.options.getString('warn-id');
        
        const removed = Warning.remove(warnId);
        
        if (!removed) {
            const embed = new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('❌ Warnung nicht gefunden!');
            
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        
        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setDescription(`✅ Warnung \`${warnId}\` wurde entfernt!`)
            .setFooter({ text: `Entfernt von ${interaction.user.tag}` })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};
