import axios from 'axios';
import { downloadContentFromMessage } from '@whiskeysockets/baileys'; // ✅ Correction de l'import
import { fileTypeFromBuffer } from 'file-type';
import FormData from 'form-data';
import stylizedChar from '../utils/fancy.js';

/**
 * Upload sur Catbox.moe (Gratuit et illimité)
 */
async function uploadToCatbox(buffer, fileName) {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, { filename: fileName });

    const res = await axios.post(
        'https://catbox.moe/user/api.php',
        form,
        { 
            headers: { ...form.getHeaders() },
            timeout: 30000 
        }
    );

    return res.data.trim();
}

async function url(monarque, m) {
    const chatId = m.chat;
    // On récupère le message cité (quoted)
    const quoted = m.quoted ? m.quoted : m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted) {
        return monarque.sendMessage(chatId, {
            text: stylizedChar('❌ Répondez à une image, vidéo, audio ou document pour obtenir un lien.')
        }, { quoted: m });
    }

    try {
        // Détection du type de média
        const type = Object.keys(quoted)[0];
        const mediaData = quoted[type];
        
        const validTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage'];
        if (!validTypes.includes(type)) {
            return monarque.sendMessage(chatId, { text: '⚠️ Format de média non supporté.' });
        }

        // Réaction de chargement
        await monarque.sendMessage(chatId, { react: { text: "⏳", key: m.key } });

        // Téléchargement propre via le stream Baileys
        const stream = await downloadContentFromMessage(
            mediaData,
            type.replace('Message', '')
        );

        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Détection de l'extension
        const ft = await fileTypeFromBuffer(buffer);
        const ext = ft?.ext || 'bin';
        const fileName = `monarque_${Date.now()}.${ext}`;

        // Upload
        const link = await uploadToCatbox(buffer, fileName);

        // Envoi du résultat stylisé
        const responseText = `
🔗 *LIEN GÉNÉRÉ* 🔗

📦 *Fichier :* ${fileName}
🌐 *URL :* ${link}

> *_Powered by Monarque-MD_*
        `.trim();

        await monarque.sendMessage(chatId, { 
            text: stylizedChar(responseText, 'bold') 
        }, { quoted: m });

        await monarque.sendMessage(chatId, { react: { text: "✅", key: m.key } });

    } catch (error) {
        console.error('❌ Upload Error:', error.message);
        await monarque.sendMessage(chatId, { text: '❌ Échec de l\'hébergement. Réessayez.' });
    }
}

export default url;
            
