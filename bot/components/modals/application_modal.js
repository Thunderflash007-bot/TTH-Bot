const { EmbedBuilder } = require('discord.js');
const Application = require('../../models/Application');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
    id: 'application',
    async execute(interaction) {
        const name = interaction.fields.getTextInputValue('app_name');
        const age = interaction.fields.getTextInputValue('app_age');
        const position = interaction.fields.getTextInputValue('app_position');
        const experience = interaction.fields.getTextInputValue('app_experience');
        const motivation = interaction.fields.getTextInputValue('app_motivation');

        const application = await Application.save({
            guildId: interaction.guild.id,
            userId: interaction.user.id,
            name,
            age,
            position,
            experience,
            motivation
        });

        const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
        
        if (config?.applicationChannelId) {
            const channel = interaction.guild.channels.cache.get(config.applicationChannelId);
            
            if (channel) {
                const embed = new EmbedBuilder()
                    .setColor('#57F287')
                    .setTitle('📋 Neue Bewerbung')
                    .addFields(
                        { name: '👤 Bewerber', value: `${interaction.user.tag} (${interaction.user.id})`, inline: false },
                        { name: '📝 Name', value: name, inline: true },
                        { name: '🎂 Alter', value: age, inline: true },
                        { name: '💼 Position', value: position, inline: false },
                        { name: '⭐ Erfahrungen', value: experience, inline: false },
                        { name: '💭 Motivation', value: motivation, inline: false }
                    )
                    .setFooter({ text: `Bewerbung #${application._id}` })
                    .setTimestamp();

                await channel.send({ embeds: [embed] });
            }
        }

        await interaction.reply({ 
            content: '✅ Deine Bewerbung wurde erfolgreich eingereicht! Wir melden uns bald bei dir.', 
            ephemeral: true 
        });
    }
};
