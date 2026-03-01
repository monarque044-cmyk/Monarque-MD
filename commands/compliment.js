/**
 * ❤️ COMMANDE COMPLIMENT - VERSION PARTAGE
 * Permet d'envoyer de la douceur à soi-même ou à un ami
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
    "Ton rire est mon médicament préféré contre la tristesse. 😊💊",
    "À tes côtés, le temps s'arrête et tout devient magique. ⏳🪄"
];

const compliment = async (monarque, m, args) => {
    try {
        const chatId = m.key.remoteJid;
        const pushName = m.pushName || "Utilisateur";
        
        // 🔍 Détection de la cible (Mention, Réponse ou Soi-même)
        const quoted = m.message?.extendedTextMessage?.contextInfo?.participant;
        const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        const target = mentioned || quoted || null;
        
        const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
        await monarque.sendMessage(chatId, { react: { text: "❤️", key: m.key } });

        let message = `🌹 *𝔻𝕠𝕦𝕔𝕖𝕦𝕣 𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖* 🌹\n\n`;
        
        if (target) {
            // Si on tague quelqu'un : "Hey @user, [Compliment]"
            message += `✨ *Coucou* @${target.split('@')[0]}, ${randomCompliment}\n\n`;
            message += `_Envoyé avec tendresse par ${pushName}_ 💌`;
        } else {
            // Si on l'utilise pour soi : "Hey [Nom], [Compliment]"
            message += `✨ *${pushName}*, ${randomCompliment}\n\n`;
        }

        message += `\n\n> Always Dare to dream big\n*𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝟚𝟚𝟟*`;

        await monarque.sendMessage(chatId, { 
            text: message,
            mentions: target ? [target] : [],
            contextInfo: {
                externalAdReply: {
                    title: "𝕊𝕡é𝕔𝕚𝕒𝕝𝕖𝕞𝕖𝕟 t 𝕡𝕠𝕦𝕣 𝕥𝕠𝕚...",
                    body: "Un message plein d'affection",
                    mediaType: 1,
                    thumbnailUrl: "https://telegra.ph",
                    sourceUrl: "" 
                }
            }
        }, { quoted: m });

    } catch (err) {
        console.error("Erreur Compliment :", err);
    }
};

export default compliment;
                    
