const { Client, GatewayIntentBits, Partials, PermissionsBitField } = require('discord.js');
const Database = require('better-sqlite3');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

const db = new Database('./warnings.db'); // SQLite veritabanı oluştur
db.prepare("CREATE TABLE IF NOT EXISTS warnings (id INTEGER PRIMARY KEY, userId TEXT, reason TEXT, moderator TEXT, timestamp TEXT)").run();

// Yetkili rolü (yalnızca bu role sahip olanlar /rolver, /rolgeri, /uyar kullanabilir)
const ADMIN_ROLE_ID = '1355324285430009946';

// Rol eşleşmeleri
const roleMappings = {
    "Takım Sahibi": "1355326672370663684",
    "Hosting Sahibi": "1355326569303900290",
    "Sunucu Sahibi": "1355326565894066549",
    "İçerik Üreticisi": "1355494923746541629",
    "takım sahibi": "1355326672370663684",
    "hosting sahibi": "1355326569303900290",
    "sunucu sahibi": "1355326565894066549",
    "içerik üreticisi": "1355494923746541629",
    "Takım sahibi": "1355326672370663684",
    "Hosting sahibi": "1355326569303900290",
    "Sunucu sahibi": "1355326565894066549",
    "İçerik reticisi": "1355494923746541629",
    "takım Sahibi": "1355326672370663684",
    "hosting Sahibi": "1355326569303900290",
    "Klan Sahibi": "1356336032248758272",
    "klan Sahibi": "1356336032248758272",
    "Klan sahibi": "1356336032248758272",
    "klan sahibi": "1356336032248758272",
    "içerik Üreticisi": "1355494923746541629"
};

client.once('ready', () => {
    console.log('✅ Bot Başarıyla Aktif Edildi!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options, member } = interaction;

    // Sadece yetkili rolü olanlar belirli komutları kullanabilir
    if (["rolver", "rolgeri", "uyar"].includes(commandName) && !member.roles.cache.has(ADMIN_ROLE_ID)) {
        return await interaction.reply({ content: "🚫 Bu komutu kullanmak için yetkiniz yok.", ephemeral: true });
    }

    // 🎭 /rolver komutu
    if (commandName === 'rolver') {
        const targetMember = options.getMember('kullanici');
        const name = options.getString('isim');
        const projectName = options.getString('proje');
        const roleName = options.getString('rol');

        if (!targetMember) return await interaction.reply("❌ Kullanıcı bulunamadı!");

        const roleId = roleMappings[roleName];
        if (!roleId) return await interaction.reply("⚠️ Geçerli bir rol ismi girin! (Takım Sahibi, Hosting Sahibi, Sunucu Sahibi, İçerik Üreticisi, Klan Sahibi)");

        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) return await interaction.reply("❌ Belirtilen rol sunucuda bulunamadı!");

        await targetMember.setNickname(`${name} ➸ ${projectName}`);
        await targetMember.roles.add(role);

        await interaction.reply(`✅ ${targetMember} kullanıcısına \`${role.name}\` rolü verildi ve adı değiştirildi. ${targetMember} Başka bir isteğiniz yoksa üstten talebi kapatabilirsiniz.`);
    }

    // 🔙 /rolgeri komutu
    if (commandName === 'rolgeri') {
        const targetMember = options.getMember('kullanici');

        if (!targetMember) return await interaction.reply("❌ Kullanıcı bulunamadı!");

        await targetMember.setNickname(null);
        await targetMember.roles.set([]);

        await interaction.reply(`♻️ ${targetMember} kullanıcısının tüm rolleri kaldırıldı ve adı sıfırlandı.`);
    }

    // 🚨 /ban komutu
    if (commandName === 'ban') {
        if (!member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: "🚫 Bu komutu kullanmak için `Üyeleri Yasakla` yetkisine sahip olmalısınız.", ephemeral: true });
        }
    
        const target = options.getMember('kullanici');
        const reason = options.getString('sebep') || 'Sebep belirtilmedi';
    
        if (!target) return interaction.reply("❌ Kullanıcı bulunamadı!");
    
        await target.send(`🚨 **${interaction.guild.name}** sunucusundan yasaklandınız! Sebep: \`${reason}\``).catch(() => {});
        await target.ban({ reason });
    
        await interaction.reply(`🚨 ${target.user.username} sunucudan yasaklandı! Sebep: \`${reason}\``);
    }
    
    // 👢 /kick komutu
    if (commandName === 'kick') {
        if (!member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply({ content: "🚫 Bu komutu kullanmak için `Üyeleri At` yetkisine sahip olmalısınız.", ephemeral: true });
        }
    
        const target = options.getMember('kullanici');
        const reason = options.getString('sebep') || 'Sebep belirtilmedi';
    
        if (!target) return interaction.reply("❌ Kullanıcı bulunamadı!");
    
        await target.send(`👢 **${interaction.guild.name}** sunucusundan atıldınız! Sebep: \`${reason}\``).catch(() => {});
        await target.kick(reason);
    
        await interaction.reply(`👢 ${target.user.username} sunucudan atıldı! Sebep: \`${reason}\``);
    }

    // 🗑️ /sil komutu
    if (commandName === 'sil') {
        const amount = options.getInteger('sayi');

        if (amount < 1 || amount > 100) {
            return interaction.reply("⚠️ 1 ile 100 arasında bir sayı girin!");
        }

        const messages = await interaction.channel.messages.fetch({ limit: amount });
        await interaction.channel.bulkDelete(messages);

        await interaction.reply(`🗑️ **${amount}** mesaj silindi.`).then(msg => setTimeout(() => msg.delete(), 5000));
    }

    // ⚠️ /uyar komutu (Uyarıları kaydet)
    if (commandName === 'uyar') {
        const target = options.getMember('kullanici');
        const reason = options.getString('sebep') || 'Sebep belirtilmedi';

        if (!target) return interaction.reply("❌ Kullanıcı bulunamadı!");

        // Uyarıyı veritabanına kaydet
        db.prepare("INSERT INTO warnings (userId, reason, moderator, timestamp) VALUES (?, ?, ?, ?)")
            .run(target.id, reason, member.user.tag, new Date().toLocaleString());

        // Toplam uyarı sayısını al
        const warnings = db.prepare("SELECT COUNT(*) AS count FROM warnings WHERE userId = ?").get(target.id);
        
        // Kullanıcıya DM gönder
	await target.send(`⚠️ **${interaction.guild.name}** sunucusunda uyarı aldınız! Sebep: \`${reason}\`. (Toplam Uyarınız: ${warnings.count})`).catch(() => {});

        // Moderatöre geri dönüş yap
        await interaction.reply(`⚠️ ${target} uyarıldı! Sebep: \`${reason}\`. (Toplam: ${warnings.count} uyarı)`);

        // Log kanalına mesaj gönder
        const logChannel = interaction.guild.channels.cache.get(1356236124900691978);
        if (logChannel) {
            logChannel.send(`⚠️ **${target.user.tag}** kullanıcısı **${reason}** sebebiyle uyarıldı! **(Toplam Uyarı: ${warnings.count})**`);
        }
    }

    // 📜 /uyarılar komutu (Uyarı geçmişini göster)
    if (commandName === 'uyarılar') {
        const target = options.getUser('kullanici');
        if (!target) return interaction.reply("❌ Kullanıcı bulunamadı!");

        const warnings = db.prepare("SELECT * FROM warnings WHERE userId = ?").all(target.id);
        
        if (warnings.length === 0) {
            return interaction.reply(`✅ ${target} kullanıcısının hiç uyarısı bulunmuyor.`);
        }

        let warningList = warnings.map(w => `🔸 **Sebep:** ${w.reason}\n🕒 **Tarih:** ${w.timestamp}\n👮 **Yetkili:** ${w.moderator}`).join("\n\n");
        await interaction.reply(`📜 **${target.tag}** kullanıcısının uyarıları:\n\n${warningList}`);
    }
});

const token = process.env.TOKEN;  
if (!token) {
  console.error("Token bulunamadı! Lütfen .env dosyasını kontrol edin.");
  process.exit(1);
}

client.login(token);

const express = require('express');
const app = express();
const port = 3100;//buraya karışmayın.

app.get('/', (req, res) => res.send('we discord'));//değiştirebilirsiniz.

app.listen(port, () =>
console.log(`Bot bu adres üzerinde çalışıyor: http://localhost:${port}`)//port
);
