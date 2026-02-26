// 🔹 Fonction utilitaire interne
function beautifyGoodnight(text) {
    const emojis = ['🌙', '💤', '🌃', '✨', '🌟', '🛌', '😴', '🌌', '🌠'];
    const selected = emojis.sort(() => 0.5 - Math.random()).slice(0, 3);
    const lineEmoji = selected.join(' ');

    return `✨ ${text}\n\n` +
           `${lineEmoji} Que tes rêves soient doux,\n` +
           `${lineEmoji} Que la nuit t’apporte la paix,\n` +
           `${lineEmoji} Et que demain soit encore meilleur.`;
}

// 🔹 L'exportation pour ton switch case
export default async function goodnight(client, message) {
    try {
        // 1. Déterminer l'ID du chat (remoteJid)
        const chatId = message.chat || message.key?.remoteJid;
        
        if (!chatId) {
            console.error("❌ Impossible de trouver l'ID du chat.");
            return;
        }

        // 2. Extraire le texte du message pour les arguments
        const msgText = message.body || 
                        message.message?.conversation || 
                        message.message?.extendedTextMessage?.text || 
                        "";
        
        const args = msgText.split(' ').slice(1);

        // 3. Déterminer la cible (mention, réponse ou expéditeur)
        const contextInfo = message.message?.extendedTextMessage?.contextInfo;
        let targetUser = message.sender || message.key?.participant || message.key?.remoteJid;

        if (contextInfo?.mentionedJid?.length > 0) {
            targetUser = contextInfo.mentionedJid[0];
        } else if (contextInfo?.participant) {
            targetUser = contextInfo.participant;
        }

        // 4. Préparer le message final
        const customText = args.join(' ');
        const messageFinal = customText || 'Passe une excellente nuit !';
        const beautified = beautifyGoodnight(messageFinal);

        // 5. Envoi
        await client.sendMessage(chatId, {
            text: `💤 *Bonne nuit* @${targetUser.split('@')[0]} 🌙\n\n${beautified}`,
            mentions: [targetUser]
        }, { quoted: message });

    } catch (error) {
        console.error('❌ Erreur critique commande Goodnight :', error);
    }
}
