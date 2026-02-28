import fs from 'fs';

const dbPath = './database.json';

// Centralisation de la gestion des données pour éviter les conflits
const getAllData = () => {
    if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));
    try {
        return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    } catch { return {}; }
};

const saveAllData = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

export default {
    name: 'rpg',
    alias: ['statut', 'profile', 'me', 'stats'],
    category: 'RPG',
    description: 'Affiche ton profil de combattant Monarque et tes statistiques',

    async execute(monarque, m, args) {
        const chatId = m.chat || m.key.remoteJid;
        const userId = m.sender || m.key.participant || m.key.remoteJid;

        // Lecture sécurisée
        const allData = getAllData();

        // Initialisation si l'utilisateur est inconnu (Partage la DB avec le Quiz)
        if (!allData[userId]) {
            allData[userId] = { 
                xp: 0, 
                level: 1, 
                prestige: 0, 
                coins: 100,
                lastHunt: 0 // Pour de futures commandes de chasse
            };
            saveAllData(allData);
        }

        const stats = allData[userId];

        // --- Logique du profil ---
        const xpNeeded = (stats.level || 1) * 200; // Aligné sur le quiz
        const progressPercent = Math.min(Math.floor(((stats.xp || 0) / xpNeeded) * 10), 10);
        const progressBar = '▰'.repeat(progressPercent) + '▱'.repeat(10 - progressPercent);

        // Détermination du Rang Monarque
        let rank = '🛡️ Novice';
        if (stats.level >= 5) rank = '🗡️ Soldat';
        if (stats.level >= 15) rank = '⚔️ Chevalier';
        if (stats.level >= 30) rank = '🚩 Commandant';
        if (stats.level >= 50) rank = '🎖️ Général';
        if (stats.level >= 80) rank = '👑 Érudit Suprême';
        if (stats.prestige > 0) rank = `🌟 Divinité (P.${stats.prestige})`;

        const statusText = `
✨ *MONARQUE RPG : PROFIL* ✨

👤 *Guerrier :* @${userId.split('@')[0]}
🎖️ *Rang :* ${rank}

📊 *Statistiques :*
├─ 🌟 *Niveau :* ${stats.level || 1}
├─ 🎖️ *Prestige :* ${stats.prestige || 0}
└─ 💰 *Fortune :* ${stats.coins || 0} pièces

📈 *Progression XP :*
[ ${stats.xp || 0} / ${xpNeeded} ]
${progressBar}

> _Astuce : Gagnez des quiz pour monter de niveau et débloquer des prestiges !_
        `.trim();

        await monarque.sendMessage(chatId, { 
            text: statusText, 
            mentions: [userId] 
        }, { quoted: m });
    }
};
