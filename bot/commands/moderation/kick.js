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
        const target = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'Kein Grund angegeben';
        const member = interaction.guild.members.cache.get(target.id);

        if (!member) {
            return interaction.reply({ content: '❌ User nicht gefunden!', ephemeral: true });
        }

        if (!member.kickable) {
            return interaction.reply({ content: '❌ Ich kann diesen User nicht kicken!', ephemeral: true });
        }

        try {
            await member.kick(reason);

            await ModerationLog.save({
                guildId: interaction.guild.id,
                userId: target.id,
                moderatorId: interaction.user.id,
                action: 'kick',
                reason
            });

            const embed = new EmbedBuilder()
                .setColor('#FEE75C')
                .setTitle('👢 User gekickt')
                .addFields(
                    { name: 'User', value: `${target.tag}`, inline: true },
                    { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Grund', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Fehler beim Kicken!', ephemeral: true });
        }
    }
};
