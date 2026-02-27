import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import stylizedChar from '../utils/fancy.js';

export default {
    name: 'viewonce',
    alias: ['vv', 'vo', 'retrouver'],
    category: 'Utils',
    description: 'Décode un message à vue unique et l\'envoie au propriétaire en privé',

    async execute(monarque, m) {
        // 1. CONFIGURATION : Ton numéro pour recevoir le média
        const myNumber = '22780828646@s.whatsapp.net';
        const remoteJid = m.chat;

        // 2. RÉCUPÉRATION DU MESSAGE CITÉ (QUOTED)
        // On vérifie si l'utilisateur a bien fait une réponse (reply)
        const quoted = m.quoted ? m.quoted : m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        // Extraction du message ViewOnce (V1 ou V2)
        const viewOnceMsg = quoted?.viewOnceMessageV2?.message || quoted?.viewOnceMessage?.message;

        if (!viewOnceMsg) {
            return await monarque.sendMessage(remoteJid, { 
                text: stylizedChar({ text: '_❌ Erreur : Répondez à une photo ou vidéo à vue unique avec la commande .viewonce_' }) 
            }, { quoted: m });
        }

        try {
            // Réaction pour confirmer le début du processus
            await monarque.sendMessage(remoteJid, { react: { text: "🕵️‍♂️", key: m.key } });

            // 3. IDENTIFICATION DU TYPE ET TÉLÉCHARGEMENT
            const type = Object.keys(viewOnceMsg)[0]; // 'imageMessage' ou 'videoMessage'
            const mediaData = viewOnceMsg[type];

            const stream = await downloadContentFromMessage(
                mediaData,
                type === 'imageMessage' ? 'image' : 'video'
            );

            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // 4. INFOS SUR LA SOURCE
            const senderName = m.pushName || "Inconnu";
            const senderJid = m.quoted?.sender || m.message?.extendedTextMessage?.contextInfo?.participant || "Inconnu";
            
            const caption = `🕵️‍♂️ *MONARQUE SPY - DÉCODAGE RÉUSSI* 🕵️‍♂️\n\n` +
                            `👤 *Expéditeur :* ${senderName} (@${senderJid.split('@')[0]})\n` +
                            `📍 *Source :* ${m.isGroup ? 'Groupe' : 'Privé'}\n` +
                            `📂 *Type :* ${type === 'imageMessage' ? 'Photo' : 'Vidéo'}\n\n` +
                            `> _Ceci est une sauvegarde manuelle demandée._`;

            // 5. ENVOI SUR TON NUMÉRO PRIVÉ
            const mediaType = type === 'imageMessage' ? 'image' : 'video';
            
            await monarque.sendMessage(myNumber, { 
                [mediaType]: buffer, 
                caption: caption,
                mentions: [senderJid]
            });

            // 6. Confirmation dans le chat actuel
            await monarque.sendMessage(remoteJid, { 
                text: stylizedChar({ text: '_✅ Média décodé et envoyé dans votre chat privé._' }) 
            }, { quoted: m });

        } catch (error) {
            console.error('❌ Erreur ViewOnce:', error);
            await monarque.sendMessage(remoteJid, { 
                text: stylizedChar({ text: '_❌ Erreur lors du téléchargement. Le média a peut-être expiré._' }) 
            }, { quoted: m });
        }
    }
};
                
