import { DigixNew } from '../utils/MomoKex.js';
import { downloadContentFromMessage } from '@whiskeysockets/baileys'; // ✅ Correction vers le nouveau package
import fs from 'fs';
import path from 'path';
import stylizedChar from '../utils/fancy.js'; // Pour le style Monarque

export async function save(client, message) {
    const remoteJid = message.key.remoteJid;
    // Ton numéro pour recevoir le média en privé
    const myNumber = client.user.id.split(':')[0] + "@s.whatsapp.net";

    // 1. Récupération du message cité (Quoted)
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    
    // Détection de tout type de média (Vues uniques OU messages normaux)
    const mediaMsg = DigixNew(quoted);

    if (!mediaMsg) {
        return await client.sendMessage(remoteJid, { 
            text: stylizedChar({ text: '_❌ Répondez à une photo, vidéo ou audio pour le sauvegarder._' }) 
        }, { quoted: message });
    }

    try {
        // Déterminer le type de média
        const type = mediaMsg.imageMessage ? 'image' : 
                     mediaMsg.videoMessage ? 'video' : 
                     mediaMsg.audioMessage ? 'audio' : null;

        if (!type) throw new Error("Format non supporté");

        // Réaction pour confirmer l'interception
        await client.sendMessage(remoteJid, { react: { text: "💾", key: message.key } });

        // 2. Téléchargement propre via le Stream Baileys
        const stream = await downloadContentFromMessage(
            mediaMsg[`${type}Message`],
            type
        );

        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // 3. Préparation du fichier temporaire avec extension correcte
        const ext = type === 'image' ? '.jpg' : type === 'video' ? '.mp4' : '.mp3';
        const tempPath = path.resolve(`./save_temp_${Date.now()}${ext}`);
        fs.writeFileSync(tempPath, buffer);

        // 4. Envoi sur TON numéro personnel
        const sender = message.pushName || 'Utilisateur';
        const caption = `💾 *MONARQUE SAVE SYSTEM*\n\n👤 *De :* ${sender}\n📍 *Source :* ${message.isGroup ? 'Groupe' : 'Privé'}\n📂 *Type :* ${type.toUpperCase()}`;

        await client.sendMessage(myNumber, {
            [type]: { url: tempPath },
            caption: type !== 'audio' ? caption : null
        });

        // 5. Nettoyage et confirmation
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        await client.sendMessage(remoteJid, { 
            text: stylizedChar({ text: '_✅ Média sauvegardé dans votre chat privé._' }) 
        }, { quoted: message });

    } catch (error) {
        console.error('Erreur Save:', error);
        await client.sendMessage(remoteJid, { text: '_❌ Erreur lors de la sauvegarde._' });
    }
}

export default save;
