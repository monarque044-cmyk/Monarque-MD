import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { Sticker, createSticker, StickerTypes } from 'waifus-sticker-maker'; // Assure-toi d'avoir cette lib

export default {
    name: 'take',
    description: 'Change les métadonnées d\'un sticker (Voleur de sticker)',

    async execute(monarque, m, args) {
        try {
            const chatId = m.key.remoteJid;
            
            // 🔍 1. Vérification de la présence d'un message cité (quoted)
            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            // On cherche le sticker soit dans le message direct, soit dans le message cité
            const isSticker = m.message?.stickerMessage || quoted?.stickerMessage;

            if (!isSticker) {
                return await monarque.sendMessage(chatId, { 
                    text: "⚠️ *Erreur Monarque* : Réponds à un sticker avec la commande `.take nom|auteur`" 
                }, { quoted: m });
            }

            // 📝 2. Préparation des nouvelles infos (Ex: .take Monarque|Bot)
            const info = args.join(" ").split("|");
            const packname = info[0] || "𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝕄𝔻";
            const author = info[1] || "𝟚𝟚𝟟";

            await monarque.sendMessage(chatId, { react: { text: "📥", key: m.key } });

            // 📥 3. Téléchargement du sticker original
            const stickerMessage = m.message?.stickerMessage || quoted?.stickerMessage;
            const stream = await downloadContentFromMessage(stickerMessage, 'sticker');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // 🎭 4. Création du nouveau sticker avec tes infos
            const newSticker = new Sticker(buffer, {
                pack: packname,
                author: author,
                type: StickerTypes.FULL,
                categories: ['🤩', '🎉'],
                id: '12345',
                quality: 70,
            });

            const stickerBuffer = await newSticker.toBuffer();

            // 📤 5. Envoi du sticker volé
            await monarque.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: m });
            await monarque.sendMessage(chatId, { react: { text: "✅", key: m.key } });

        } catch (error) {
            console.error('[TAKE ERROR]:', error.message);
            await monarque.sendMessage(m.key.remoteJid, { 
                text: "⚠️ *Erreur* : Impossible de modifier ce sticker." 
            }, { quoted: m });
        }
    }
};
    
