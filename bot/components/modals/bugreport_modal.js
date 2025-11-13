const { EmbedBuilder } = require('discord.js');
const BugReport = require('../../models/BugReport');

module.exports = {
    id: 'bugreport_modal',
    
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        try {
            const title = interaction.fields.getTextInputValue('bug_title');
            const description = interaction.fields.getTextInputValue('bug_description');
            const steps = interaction.fields.getTextInputValue('bug_steps');
            const expected = interaction.fields.getTextInputValue('bug_expected');
            const actual = interaction.fields.getTextInputValue('bug_actual');

            const bugReport = BugReport.create({
                userId: interaction.user.id,
                username: interaction.user.tag,
                guildId: interaction.guild?.id || null,
                guildName: interaction.guild?.name || 'DM',
                title: title,
                description: description,
                steps: steps,
                expectedBehavior: expected,
                actualBehavior: actual
            });

            const confirmEmbed = new EmbedBuilder()
                .setColor('#57F287')
                .setTitle('✅ Bug Report erstellt')
                .setDescription(`Vielen Dank für deinen Bug Report!\n\nDein Report wurde mit der ID **${bugReport.id}** erfasst.`)
                .addFields(
                    { name: 'Bug ID', value: bugReport.id, inline: true },
                    { name: 'Status', value: 'Offen', inline: true }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [confirmEmbed] });

            // DM an Admin
            try {
                const adminId = '901518853635444746';
                console.log('📨 Fetching admin user (ID:', adminId, ')...');
                const admin = await interaction.client.users.fetch(adminId).catch(err => {
                    console.error('❌ Failed to fetch admin:', err.message);
                    return null;
                });
                console.log('👤 Admin found:', admin ? `${admin.username} (${admin.id})` : 'No');
                
                if (admin) {
                    console.log('📤 Sending DM...');
                
                const adminEmbed = new EmbedBuilder()
                    .setColor('#ED4245')
                    .setTitle('🐛 Neuer Bug Report')
                    .addFields(
                        { name: 'Bug ID', value: bugReport.id, inline: true },
                        { name: 'Server', value: bugReport.guildName || 'DM', inline: true },
                        { name: 'User', value: `${bugReport.username} (${bugReport.userId})`, inline: false },
                        { name: 'Titel', value: title, inline: false },
                        { name: 'Beschreibung', value: description.substring(0, 1000), inline: false }
                    )
                    .setTimestamp();

                await admin.send({ embeds: [adminEmbed] });
                console.log('✅ Admin DM sent successfully');
            } else {
                console.log('⚠️ Admin user could not be fetched');
            }
        } catch (error) {
                console.error('Fehler beim Senden der Admin-DM:', error);
            }

        } catch (error) {
            console.error('Fehler beim Erstellen des Bug Reports:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ED4245')
                .setTitle('❌ Fehler')
                .setDescription('Es gab einen Fehler beim Erstellen deines Bug Reports.')
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};
