import { getPlayerData } from "../utils/levels.js";

const rank = async (monarque, m, args) => {
    try {
        const chatId = m.key.remoteJid;
        const userId = m.key.participant || m.key.remoteJid;
        const pushName = m.pushName || "Utilisateur";
        
        const stats = getPlayerData(userId);
        const nextLevelXp = stats.level * 200;

        let txt = `╔══════════════════╗\n`;
        txt += `   🎖️ *PROFIL MONARQUE* 🎖️\n`;
        txt += `╠══════════════════╣\n`;
        txt += `👤 *Nom* : ${pushName}\n`;
        txt += `🏅 *Niveau* : ${stats.level}\n`;
        txt += `✨ *XP* : ${stats.xp} / ${nextLevelXp}\n`;
        txt += `📊 *Progression* : ${Math.floor((stats.xp / nextLevelXp) * 100)}%\n`;
        txt += `╚══════════════════╝\n\n`;
        txt += `> Continue à répondre aux quiz pour monter en grade !`;

        await monarque.sendMessage(chatId, { text: txt }, { quoted: m });
    } catch (err) {
        console.error(err);
    }
};

export default rank;
