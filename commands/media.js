import fs from 'fs';
import { exec } from 'child_process';
import { downloadContentFromMessage } from '@whiskeysockets/baileys'; // ✅ Correction de l'import

// 🔹 Utilitaire pour télécharger proprement le média
async function downloadMedia(quoted, type) {
    const stream = await downloadContentFromMessage(quoted, type);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
}

export async function photo(monarque, m) {
    try {
        const chatId = m.chat;
        const quoted = m.quoted ? m.quoted : m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const target = quoted?.stickerMessage;
        
        if (!target) {
            return await monarque.sendMessage(chatId, {
                text: '📸 *MONARQUE-MD*\n\nRépondez à un sticker pour le convertir en image.\n\nUsage: *.photo* (en réponse)'
            }, { quoted: m });
        }

        await monarque.sendMessage(chatId, { react: { text: "📸", key: m.key } });

        // Téléchargement du sticker
        const buffer = await downloadMedia(target, 'sticker');
        const filename = `./temp_sticker_${Date.now()}.png`;

        // Conversion via FFmpeg pour garantir la compatibilité
        fs.writeFileSync(`./temp_${Date.now()}.webp`, buffer);
        
        exec(`ffmpeg -i ./temp_${Date.now()}.webp ${filename}`, async (err) => {
            if (err) throw err;

            await monarque.sendMessage(chatId, {
                image: fs.readFileSync(filename),
                caption: '✨ *𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 227* ✨'
            }, { quoted: m });

            // Nettoyage
            if (fs.existsSync(filename)) fs.unlinkSync(filename);
            if (fs.existsSync(`./temp_${Date.now()}.webp`)) fs.unlinkSync(`./temp_${Date.now()}.webp`);
        });

    } catch (e) {
        console.error(e);
        await monarque.sendMessage(m.chat, { text: '❌ Erreur de conversion sticker -> photo.' });
    }
}

export async function tomp3(monarque, m) {
    try {
        const chatId = m.chat;
        const quoted = m.quoted ? m.quoted : m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const target = quoted?.videoMessage || quoted?.audioMessage;
        
        if (!target) {
            return await monarque.sendMessage(chatId, {
                text: '🎵 *MONARQUE-MD*\n\nRépondez à une vidéo ou un vocal pour extraire l\'audio.'
            }, { quoted: m });
        }

        await monarque.sendMessage(chatId, { react: { text: "🎧", key: m.key } });

        const type = quoted?.videoMessage ? 'video' : 'audio';
        const buffer = await downloadMedia(target, type);
        
        const inputPath = `./temp_in_${Date.now()}`;
        const outputPath = `./temp_out_${Date.now()}.mp3`;

        fs.writeFileSync(inputPath, buffer);

        // Extraction audio haute qualité via FFmpeg
        exec(`ffmpeg -i ${inputPath} -vn -ar 44100 -ac 2 -b:a 192k ${outputPath}`, async (err) => {
            if (err) {
                fs.unlinkSync(inputPath);
                throw err;
            }

            await monarque.sendMessage(chatId, {
                audio: fs.readFileSync(outputPath),
                mimetype: 'audio/mp4',
                ptt: false
            }, { quoted: m });

            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
        });

    } catch (e) {
        console.error(e);
        await monarque.sendMessage(m.chat, { text: '❌ Erreur d\'extraction audio.' });
    }
}

export default { photo, tomp3 };
                                           
