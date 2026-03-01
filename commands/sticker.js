import { Sticker, StickerTypes } from 'wa-sticker-formatter';

const sticker = async (monarque, m, args) => {
    try {
        const chatId = m.key.remoteJid;
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage || m.message;
        const mime = quoted?.imageMessage ? 'image' : quoted?.videoMessage ? 'video' : null;

        if (!mime) return await monarque.sendMessage(chatId, { text: "⚠️ Réponds à une image ou une courte vidéo !" });

        await monarque.sendMessage(chatId, { react: { text: "🎨", key: m.key } });

        // Téléchargement du média (Baileys)
        const buffer = await monarque.downloadMediaMessage(m);

        const sMetadata = new Sticker(buffer, {
            pack: "𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝕄𝔻",
            author: "𝟚𝟚𝟟",
            type: StickerTypes.FULL,
            quality: 70
        });

        await monarque.sendMessage(chatId, { sticker: await sMetadata.toBuffer() }, { quoted: m });

    } catch (err) {
        console.error(err);
        await monarque.sendMessage(m.key.remoteJid, { text: "❌ Erreur lors de la création du sticker." });
    }
};

export default sticker;
