const { EmbedBuilder } = require('discord.js');

function mcEmbed(thumbnail = '../../yuta-bg.jpeg', title = 'Invaild Title', des = 'Invaild metadata', yutaAv) {
    const emb = new EmbedBuilder()
        .setAuthor({ name: 'Yuta Music', iconURL: yutaAv })
        .setThumbnail(thumbnail || yutaAv)
        .setColor('LuminousVividPink')
        .setTitle(title)
        .setDescription(des);
    return emb;
}
module.exports = mcEmbed;