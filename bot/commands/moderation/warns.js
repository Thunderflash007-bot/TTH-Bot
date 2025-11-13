const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Warning = require('../../models/Warning');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warns')
        .setDescription('Zeigt die Warnungen eines Users')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Der User')
                .setRequired(false)),
    
    async execute(interaction) {
        const target = interaction.options.getUser('user') || interaction.user;
        const warnings = Warning.getUserWarnings(target.id, interaction.guild.id);
        
        if (warnings.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('#57F287')
                .setDescription(`✅ ${target} hat keine aktiven Warnungen!`);
            
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        
        const embed = new EmbedBuilder()
            .setColor('#FEE75C')
            .setAuthor({ 
                name: `Warnungen von ${target.tag}`,
                iconURL: target.displayAvatarURL()
            })
            .setDescription(`⚠️ **${warnings.length}** aktive Warnung(en)`)
            .setTimestamp();
        
        // Zeige die letzten 10 Warnungen
        const recentWarnings = warnings.slice(-10).reverse();
        
        for (const warning of recentWarnings) {
            const moderator = await interaction.client.users.fetch(warning.moderatorId).catch(() => null);
            const date = new Date(warning.timestamp).toLocaleString('de-DE');
            
            embed.addFields({
                name: `📝 ${date}`,
                value: `**Grund:** ${warning.reason}\n**Moderator:** ${moderator ? moderator.tag : 'Unbekannt'}\n**ID:** \`${warning.id}\``,
                inline: false
            });
        }
        
        if (warnings.length > 10) {
            embed.setFooter({ text: `Zeige die letzten 10 von ${warnings.length} Warnungen` });
        }
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
