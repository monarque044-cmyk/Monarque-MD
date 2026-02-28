import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { Sticker, StickerTypes } from 'waifus-sticker-maker'; // ✅ Un seul import propre ici

export default {
    name: 'take',
    description: 'Change les métadonnées d\'un sticker (Voleur de sticker)',

    async execute(monarque, m, args) {
        try {
            const chatId = m.key.remoteJid;
            
            // 🔍 1. Vérification du message cité (quoted) ou direct
            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const stickerMessage = m.message?.stickerMessage || quoted?.stickerMessage;

            if (!stickerMessage) {
                return await monarque.sendMessage(chatId, { 
                    text: "⚠️ *Erreur Monarque* : Réponds à un sticker avec la commande `.take Nom|Auteur`" 
                }, { quoted: m });
            }

            // 📝 2. Préparation des infos (Ex: .take Monarque|227)
            const info = args.join(" ").split("|");
            const packname = (info[0] && info[0].trim()) || "𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝕄𝔻";
            const author = (info[1] && info[1].trim()) || "𝟚𝟚𝟟";

            await monarque.sendMessage(chatId, { react: { text: "📥", key: m.key } });

            // 📥 3. Téléchargement du sticker original
            const stream = await downloadContentFromMessage(stickerMessage, 'sticker');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // 🎭 4. Création du nouveau sticker (nommé "finalSticker" pour éviter tout conflit)
            const finalSticker = new Sticker(buffer, {
                pack: packname,
                author: author,
                type: StickerTypes.FULL,
                categories: ['🤩', '👑'],
                id: 'monarque_stk_' + Date.now(),
                quality: 75,
            });

            const stickerBuffer = await finalSticker.toBuffer();

            // 📤 5. Envoi avec succès
            await monarque.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: m });
            await monarque.sendMessage(chatId, { react: { text: "✅", key: m.key } });

        } catch (error) {
            console.error('[TAKE ERROR]:', error.message);
            await monarque.sendMessage(m.key.remoteJid, { 
                text: "⚠️ *Erreur* : Impossible de modifier ce sticker. Vérifie que c'est bien un sticker statique." 
            }, { quoted: m });
        }
    }
};
