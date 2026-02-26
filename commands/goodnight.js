export default {
    name: 'goodnight',
    alias: ['gn', 'lovenight', 'bonne nuit'],
    category: 'Fun',
    description: '💤 Envoie un message mignon de bonne nuit à quelqu’un',
    usage: '.goodnight @user ou .goodnight <texte>',

    async execute(monarque, m, args) {
        const chatId = m.chat;
        let targetUser;

        // 🔹 Gestion de la cible (mention, réponse ou soi-même)
        const ctx = m.message?.extendedTextMessage?.contextInfo;
        if (ctx?.mentionedJid?.length) {
            targetUser = ctx.mentionedJid[0];
        } else if (ctx?.participant) {
            targetUser = ctx.participant;
        } else {
            targetUser = m.sender;
        }

        try {
            // 🔹 Déterminer le message
            let customText = args.join(' ');
            if (ctx?.mentionedJid?.length) {
                // Si on mentionne quelqu'un, on enlève la mention du texte
                customText = args.slice(1).join(' ');
            }
            
            const messageFinal = customText || 'Passe une excellente nuit !';

            // 🔹 Embellissement du message
            const beautified = beautifyGoodnight(messageFinal);

            // 🔹 Envoi du message
            await monarque.sendMessage(chatId, {
                text: `💤 *Bonne nuit* @${targetUser.split('@')[0]} 🌙\n\n${beautified}`,
                mentions: [targetUser],
            }, { quoted: m });

        } catch (error) {
            console.error('❌ Erreur commande Goodnight :', error);
            await monarque.sendMessage(chatId, {
                text: '❌ Impossible d’envoyer le message de bonne nuit.',
            }, { quoted: m });
        }
    }
};

// 🔹 Fonction pour styliser le message
function beautifyGoodnight(text) {
    const emojis = ['🌙', '💤', '🌃', '✨', '🌟', '🛌', '😴', '🌌', '🌠'];
    
    // Mélanger et prendre 3 emojis
    const selected = emojis.sort(() => 0.5 - Math.random()).slice(0, 3);
    const lineEmoji = selected.join(' ');

    return `✨ ${text}\n\n` +
           `${lineEmoji} Que tes rêves soient doux,\n` +
           `${lineEmoji} Que la nuit t’apporte la paix,\n` +
           `${lineEmoji} Et que demain soit encore meilleur.`;
}
