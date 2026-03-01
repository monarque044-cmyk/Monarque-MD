import os from 'os';

/**
 * 👑 MENU MONARQUE MD
 * Adapté pour une robustesse maximale sur Katabump
 */
const menu = async (monarque, m, args) => {
    try {
        const chatId = m.key.remoteJid;
        const pushName = m.pushName || "Utilisateur";
        const prefix = "."; // Ton préfixe par défaut

        // --- Infos Système ---
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const usedRam = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);

        // --- Construction du Message ---
        let txt = `╔══════════════════╗\n`;
        txt += `      *𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 MD 𝟚𝟘𝟚𝟞* 🚀\n`;
        txt += `╠══════════════════╣\n`;
        txt += `👤 *Salut* : ${pushName}\n`;
        txt += `⏱️ *Uptime* : ${hours}h ${minutes}m\n`;
        txt += `🚀 *RAM* : ${usedRam}MB\n`;
        txt += `📅 *Date* : ${new Date().toLocaleDateString('fr-FR')}\n`;
        txt += `╚══════════════════╝\n\n`;

        // --- Catégories (On les remplira au fur et à mesure) ---
        txt += `📊 *LISTE DES COMMANDES* :\n\n`;
        
        txt += `╭──〔 ⚖️ *GÉNÉRAL* 〕\n`;
        txt += `│ › ${prefix}menu\n`;
        txt += `│ › ${prefix}ping\n`;
        txt += `│ › ${prefix}uptime\n`;
        txt += `╰───────────────\n\n`;

        txt += `╭──〔 🎮 *JEUX* 〕\n`;
        txt += `│ › ${prefix}quiz (Bientôt)\n`;
        txt += `╰───────────────\n\n`;

        txt += `> Always Dare to dream big\n`;
        txt += `*𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝟚𝟚𝟟*`;

        // --- Envoi avec "External Ad Reply" (Le style pro) ---
        await monarque.sendMessage(chatId, {
            text: txt,
            contextInfo: {
                externalAdReply: {
                    title: "𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝕊𝕪𝕤𝕥𝕖𝕞",
                    body: "Connecté avec succès",
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    thumbnailUrl: "https://telegra.ph", // Change ce lien si tu as une image
                    sourceUrl: "" // Vide pour cacher GitHub
                }
            }
        }, { quoted: m });

        // Réaction de succès
        await monarque.sendMessage(chatId, { react: { text: "🔱", key: m.key } });

    } catch (err) {
        console.error("❌ Erreur Menu :", err);
    }
};

export default menu;
