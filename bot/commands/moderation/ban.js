const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ModerationLog = require('../../models/ModerationLog');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bannt einen User vom Server')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Der zu bannende User')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Grund für den Ban')
                .setRequired(false)),
    
    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'Kein Grund angegeben';
        const member = interaction.guild.members.cache.get(target.id);

        if (!member) {
            return interaction.reply({ content: '❌ User nicht gefunden!', ephemeral: true });
        }

        if (!member.bannable) {
            return interaction.reply({ content: '❌ Ich kann diesen User nicht bannen!', ephemeral: true });
        }

        try {
            // Versuche dem User eine DM zu senden
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#ED4245')
                    .setTitle('🔨 Du wurdest gebannt')
                    .setDescription(`Du wurdest von **${interaction.guild.name}** gebannt.`)
                    .addFields(
                        { name: '📋 Grund', value: reason, inline: false },
                        { name: '👮 Moderator', value: interaction.user.tag, inline: false }
                    )
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp();
                
                await target.send({ embeds: [dmEmbed] });
            } catch (err) {
                // User hat DMs deaktiviert
            }

            await member.ban({ reason });

            await ModerationLog.save({
                guildId: interaction.guild.id,
                userId: target.id,
                moderatorId: interaction.user.id,
                action: 'ban',
                reason
            });

            const embed = new EmbedBuilder()
                .setColor('#ED4245')
                .setAuthor({ 
                    name: 'Moderation: User gebannt',
                    iconURL: interaction.guild.iconURL()
                })
                .setThumbnail(target.displayAvatarURL({ size: 256 }))
                .addFields(
                    { name: '👤 Betroffener User', value: `${target} (${target.tag})\n\`${target.id}\``, inline: true },
                    { name: '👮 Moderator', value: `${interaction.user}\n${interaction.user.tag}`, inline: true },
                    { name: '📋 Grund', value: `\`\`\`${reason}\`\`\``, inline: false },
                    { name: '⏰ Zeitpunkt', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                )
                .setFooter({ text: `Case ID: ${Date.now()}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Fehler beim Bannen des Users!', ephemeral: true });
        }
    }
};
