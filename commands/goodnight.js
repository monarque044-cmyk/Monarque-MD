// Fonction pour styliser le message (placée à l'extérieur)
export default async function beautifyGoodnight(text) {
    const emojis = ['🌙', '💤', '🌃', '✨', '🌟', '🛌', '😴', '🌌', '🌠'];
    const selected = emojis.sort(() => 0.5 - Math.random()).slice(0, 3);
    const lineEmoji = selected.join(' ');

    return `✨ ${text}\n\n` +
           `${lineEmoji} Que tes rêves soient doux,\n` +
           `${lineEmoji} Que la nuit t’apporte la paix,\n` +
           `${lineEmoji} Et que demain soit encore meilleur.`;
}

// L'exportation doit être la fonction elle-même
export default async function goodnight(client, message) {
    const chatId = message.chat;
    const m = message; // Alias pour simplifier la lecture
    const args = m.body ? m.body.split(' ').slice(1) : [];

    let targetUser;

    // 🔹 Détection de la cible (mention ou réponse)
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
        const messageFinal = customText || 'Passe une excellente nuit !';

        // 🔹 Embellissement
        const beautified = beautifyGoodnight(messageFinal);

        // 🔹 Envoi
        await client.sendMessage(chatId, {
            text: `💤 *Bonne nuit* @${targetUser.split('@')[0]} 🌙\n\n${beautified}`,
            mentions: [targetUser],
        }, { quoted: m });

    } catch (error) {
        console.error('❌ Erreur commande Goodnight :', error);
        await client.sendMessage(chatId, { text: '❌ Erreur lors de l\'envoi.' }, { quoted: m });
    }
}
