const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { clientId, guildId, token } = require('./config.json');

const commands = [
    new SlashCommandBuilder()
        .setName('rolver')
        .setDescription('Belirtilen kullanıcıya rol ver ve ismini değiştir')
        .addUserOption(option => option.setName('kullanici').setDescription('Kullanıcıyı seçin').setRequired(true))
        .addStringOption(option => option.setName('isim').setDescription('Yeni isim').setRequired(true))
        .addStringOption(option => option.setName('proje').setDescription('Proje ismi').setRequired(true))
        .addStringOption(option => option.setName('rol').setDescription('Takım Sahibi, Hosting Sahibi, Klan Sahibi, Sunucu Sahibi, İçerik Üreticisi').setRequired(true)),

    new SlashCommandBuilder()
        .setName('rolgeri')
        .setDescription('Belirtilen kullanıcının tüm rollerini sıfırla')
        .addUserOption(option => option.setName('kullanici').setDescription('Kullanıcıyı seçin').setRequired(true)),

    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Belirtilen kullanıcıyı banla')
        .addUserOption(option => option.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
        .addStringOption(option => option.setName('sebep').setDescription('Sebep')),

    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Belirtilen kullanıcıyı at')
        .addUserOption(option => option.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
        .addStringOption(option => option.setName('sebep').setDescription('Sebep')),

    new SlashCommandBuilder()
        .setName('sil')
        .setDescription('Belirtilen sayıda mesajı sil')
        .addIntegerOption(option => option.setName('sayi').setDescription('Silinecek mesaj sayısı').setRequired(true)),

    new SlashCommandBuilder()
        .setName('uyar')
        .setDescription('Kullanıcıya uyarı ver')
        .addUserOption(option => option.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
        .addStringOption(option => option.setName('sebep').setDescription('Sebep')),

    new SlashCommandBuilder()
        .setName('uyarılar')
        .setDescription('Belirtilen kullanıcının uyarı geçmişini göster')
        .addUserOption(option => option.setName('kullanici').setDescription('Kullanıcı').setRequired(true)),
];

(async () => {
    await new REST({ version: '10' }).setToken(token).put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
})();
