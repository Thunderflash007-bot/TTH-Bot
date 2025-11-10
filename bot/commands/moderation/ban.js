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
                .setTitle('🔨 User gebannt')
                .addFields(
                    { name: 'User', value: `${target.tag}`, inline: true },
                    { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Grund', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Fehler beim Bannen!', ephemeral: true });
        }
    }
};
