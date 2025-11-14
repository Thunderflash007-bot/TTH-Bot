const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ModerationLog = require('../../models/ModerationLog');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kickt einen User vom Server')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Der zu kickende User')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Grund für den Kick')
                .setRequired(false)),
    
    async execute(interaction) {
        // Defer reply um Timeout zu vermeiden
        await interaction.deferReply();

        const target = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'Kein Grund angegeben';
        const member = interaction.guild.members.cache.get(target.id);

        if (!member) {
            return interaction.editReply({ content: '❌ User nicht gefunden!' });
        }

        if (!member.kickable) {
            return interaction.editReply({ content: '❌ Ich kann diesen User nicht kicken!' });
        }

        try {
            // Versuche dem User eine DM zu senden
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#FEE75C')
                    .setTitle('👢 Du wurdest gekickt')
                    .setDescription(`Du wurdest von **${interaction.guild.name}** gekickt.`)
                    .addFields(
                        { name: '📋 Grund', value: reason, inline: false },
                        { name: '👮 Moderator', value: interaction.user.tag, inline: false }
                    )
                    .setTimestamp();
                
                await target.send({ embeds: [dmEmbed] });
            } catch (err) {
                // User hat DMs deaktiviert
            }

            await member.kick(reason);

            // Logging
            try {
                ModerationLog.create({
                    guildId: interaction.guild.id,
                    userId: target.id,
                    moderatorId: interaction.user.id,
                    action: 'kick',
                    reason
                });
            } catch (logError) {
                console.error('Logging Error:', logError);
            }

            const embed = new EmbedBuilder()
                .setColor('#FEE75C')
                .setAuthor({ 
                    name: 'Moderation: User gekickt',
                    iconURL: interaction.guild.iconURL()
                })
                .addFields(
                    { name: '👤 Betroffener User', value: `${target} (${target.tag})\n\`${target.id}\``, inline: true },
                    { name: '👮 Moderator', value: `${interaction.user}\n${interaction.user.tag}`, inline: true },
                    { name: '📋 Grund', value: `\`\`\`${reason}\`\`\``, inline: false },
                    { name: '⏰ Zeitpunkt', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                )
                .setFooter({ text: `Case ID: ${Date.now()}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Kick Error:', error);
            await interaction.editReply({ content: '❌ Fehler beim Kicken des Users!' });
        }
    }
};
