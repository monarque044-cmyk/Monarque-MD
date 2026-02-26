function beautifyGoodnight(text) {
    const emojis = ['🌙', '💤', '🌃', '✨', '🌟', '🛌', '😴', '🌌', '🌠'];
    const selected = emojis.sort(() => 0.5 - Math.random()).slice(0, 3);
    const lineEmoji = selected.join(' ');

    return `✨ ${text}\n\n` +
           `${lineEmoji} Que tes rêves soient doux,\n` +
           `${lineEmoji} Que la nuit t’apporte la paix,\n` +
           `${lineEmoji} Et que demain soit encore meilleur.`;
}

export default async function goodnight(client, message) {
    try {
        // 1. Identification du chat (Indispensable pour répondre)
        const chatId = message.chat || message.key?.remoteJid;
        if (!chatId) return console.log("⚠️ Chat ID introuvable");

        // 2. Récupération propre du texte
        const msgText = message.body || 
                        message.message?.conversation || 
                        message.message?.extendedTextMessage?.text || 
                        "";
        
        const args = msgText.split(' ').slice(1);

        // 3. Identification de la cible (Sécurité Anti-Crash)
        const contextInfo = message.message?.extendedTextMessage?.contextInfo;
        let targetUser = message.sender || message.key?.participant || chatId;

        // Si mention, on prend le premier JID du tableau
        if (contextInfo?.mentionedJid && contextInfo.mentionedJid.length > 0) {
            targetUser = contextInfo.mentionedJid[0];
        } else if (contextInfo?.participant) {
            targetUser = contextInfo.participant;
        }

        // 4. Préparation du texte
        const customText = args.join(' ');
        const messageFinal = customText || 'Passe une excellente nuit !';
        const beautified = beautifyGoodnight(messageFinal);

        // 5. Nettoyage du JID pour l'affichage (@123456789)
        // On vérifie que targetUser est bien une string avant split
        const formattedName = (typeof targetUser === 'string') ? targetUser.split('@')[0] : 'toi';

        // 6. Envoi
        await client.sendMessage(chatId, {
            text: `💤 *Bonne nuit* @${formattedName} 🌙\n\n${beautified}`,
            mentions: [targetUser]
        }, { quoted: message });

    } catch (error) {
        // Affiche l'erreur précise sans arrêter le bot
        console.error('❌ Erreur capturée dans Goodnight :', error.message);
    }
}
