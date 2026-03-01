/**
 * ❤️ COMMANDE COMPLIMENT - MONARQUE MD
 * Envoie des douceurs et du romantisme
 */

const compliments = [
    "Tu es le soleil qui illumine mes journées les plus sombres. ☀️💖",
    "Ton sourire est la plus belle mélodie que mes yeux aient jamais entendue. 🎶✨",
    "Le monde est bien plus beau depuis que tu en fais partie. 🌎🌹",
    "Tu as ce don rare de rendre chaque moment spécial juste par ta présence. ✨💎",
    "Si la beauté était un crime, tu serais en prison à perpétuité. ⚖️😍",
    "Ton intelligence n'a d'égale que ta gentillesse. 🧠❤️",
    "Tu es comme une étoile : même de loin, tu brilles dans mon cœur. ⭐💘",
    "Il y a des gens qui sont des poèmes, et toi, tu es tout un recueil. 📖🌷",
    "Rien qu'en pensant à toi, mon cœur se met à danser. 💃💓",
    "Tu es la preuve vivante que la perfection existe. 👑💫",
    "Ton rire est mon médicament préféré contre la tristesse. 💊😊",
    "À tes côtés, le temps s'arrête et tout devient magique. ⏳🪄"
];

const compliment = async (monarque, m, args) => {
    try {
        const chatId = m.key.remoteJid;
        const pushName = m.pushName || "Utilisateur";
        
        // Sélection aléatoire
        const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];

        // Réaction douce
        await monarque.sendMessage(chatId, { react: { text: "❤️", key: m.key } });

        let message = `🌹 *𝔻𝕠𝕦𝕔𝕖𝕦𝕣 𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖* 🌹\n\n`;
        message += `✨ *${pushName}*, ${randomCompliment}\n\n`;
        message += `> Always Dare to dream big\n`;
        message += `*𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝟚𝟚𝟟*`;

        await monarque.sendMessage(chatId, { 
            text: message,
            contextInfo: {
                externalAdReply: {
                    title: "𝕊𝕡é𝕔𝕚𝕒𝕝𝕖𝕞𝕖𝕟𝕥 𝕡𝕠𝕦𝕣 𝕥𝕠𝕚...",
                    body: "Un peu de douceur dans ce monde",
                    mediaType: 1,
                    thumbnailUrl: "https://telegra.ph", // Optionnel : une image romantique
                    sourceUrl: "" 
                }
            }
        }, { quoted: m });

    } catch (err) {
        console.error("Erreur Compliment :", err);
    }
};

export default compliment;
