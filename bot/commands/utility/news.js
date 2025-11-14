const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('news')
        .setDescription('Erstellt eine News-Ankündigung')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption(option =>
            option.setName('titel')
                .setDescription('Titel der News')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('inhalt')
                .setDescription('Inhalt der News')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel für die News (optional)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('farbe')
                .setDescription('Embed-Farbe (z.B. #5865F2)')
                .setRequired(false)),
    
    async execute(interaction) {
        const title = interaction.options.getString('titel');
        const content = interaction.options.getString('inhalt');
        const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
        const color = interaction.options.getString('farbe') || '#5865F2';
        
        const embed = new EmbedBuilder()
            .setTitle(`📰 ${title}`)
            .setDescription(content)
            .setColor(color)
            .setFooter({ text: `News von ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();
        
        await targetChannel.send({ embeds: [embed] });
        
        const confirmEmbed = new EmbedBuilder()
            .setColor('#57F287')
            .setDescription(`✅ News wurde in ${targetChannel} gepostet!`);
        
        await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
    }
};
