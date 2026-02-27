import fs from 'fs';

const dbPath = './database.json';

// Fonction pour récupérer les données
function getPlayerData(userId) {
    if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    // Initialisation si l'utilisateur est nouveau
    if (!data[userId]) {
        data[userId] = { xp: 0, level: 1, prestige: 0, coins: 100 };
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    }
    return data[userId];
}

export default {
    name: 'statut',
    alias: ['profile', 'me', 'rpg'],
    category: 'RPG',
    description: 'Affiche ton profil de combattant Monarque',

    async execute(monarque, m) {
        const userId = m.sender;
        const stats = getPlayerData(userId);

        // Calcul du niveau (Exemple : 100 XP par niveau)
        const nextLevelXp = stats.level * 150;
        const progress = Math.floor((stats.xp / nextLevelXp) * 10);
        const progressBar = '▰'.repeat(progress) + '▱'.repeat(10 - progress);

        // Déterminer le titre selon le niveau
        let rank = 'Paysan';
        if (stats.level >= 5) rank = 'Soldat';
        if (stats.level >= 10) rank = 'Chevalier';
        if (stats.level >= 20) rank = 'Commandant';
        if (stats.level >= 50) rank = '👑 L\'Érudit Suprême';

        const statusText = `
✨ *PROFIL MONARQUE-RPG* ✨
👤 *Guerrier :* @${userId.split('@')[0]}
🎖️ *Rang :* ${rank}

📊 *Niveau :* ${stats.level}
🌟 *Prestige :* ${stats.prestige}
💰 *Pièces :* ${stats.coins}

📈 *Expérience :* [ ${stats.xp} / ${nextLevelXp} ]
${progressBar}

_Répondez aux quiz ou gagnez des duels pour monter en niveau !_
        `.trim();

        await monarque.sendMessage(m.chat, { 
            text: statusText, 
            mentions: [userId] 
        }, { quoted: m });
    }
};
