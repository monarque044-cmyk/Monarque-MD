/**
 * 🌙 COMMANDE GOODNIGHT - MONARQUE MD
 * Souhaite une douce nuit avec style
 */

const wishes = [
    "Que les étoiles veillent sur tes rêves cette nuit. ✨🛌",
    "Ferme les yeux, oublie tes soucis et laisse la lune te bercer. 🌙💤",
    "Une douce nuit t'attend, repose-toi bien pour briller demain. 🌟👑",
    "Que ton sommeil soit aussi paisible qu'une mer calme. 🌊🌙",
    "Je t'envoie un nuage de tendresse pour accompagner ta nuit. ☁️💖",
    "Dors bien, demain est une nouvelle chance de réaliser tes rêves. 🚀✨",
    "Que les anges murmurent des poèmes à ton oreille pendant ton sommeil. 👼🎶",
    "Repose-toi bien, le monde a besoin de ta lumière demain matin. ☀️💤"
];

const goodnight = async (monarque, m, args) => {
    try {
        const chatId = m.key.remoteJid;
        const pushName = m.pushName || "Utilisateur";
        
        // Détection de la cible (Mention ou Réponse)
        const quoted = m.message?.extendedTextMessage?.contextInfo?.participant;
        const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        const target = mentioned || quoted || null;
        
        const randomWish = wishes[Math.floor(Math.random() * wishes.length)];
        
        // Réaction nocturne
        await monarque.sendMessage(chatId, { react: { text: "😴", key: m.key } });

        let message = `🌙 *𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 ℕ𝕦𝕚𝕥 𝔻𝕠𝕦𝕔𝕖* 🌙\n\n`;
        
        if (target) {
            message += `✨ *Douce nuit* @${target.split('@')[0]}, ${randomWish}\n\n`;
            message += `_Souhaité avec soin par ${pushName}_ 🕊️`;
        } else {
            message += `✨ *Bonne nuit ${pushName}*, ${randomWish}\n\n`;
        }

        message += `\n\n> Always Dare to dream big\n*𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝟚𝟚𝟟*`;

        await monarque.sendMessage(chatId, { 
            text: message,
            mentions: target ? [target] : [],
            contextInfo: {
                externalAdReply: {
                    title: "✨ Fais de beaux rêves...",
                    body: "Le repos du guerrier Monarque",
                    mediaType: 1,
                    thumbnailUrl: "https://telegra.ph", 
                    sourceUrl: "" 
                }
            }
        }, { quoted: m });

    } catch (err) {
        console.error("Erreur Goodnight :", err);
    }
};

export default goodnight;
