import { Sticker, StickerTypes } from 'wa-sticker-formatter';

const take = async (monarque, m, args) => {
    try {
        const chatId = m.key.remoteJid;
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quoted?.stickerMessage) return await monarque.sendMessage(chatId, { text: "⚠️ Réponds à un sticker !" });

        const info = args.join(" ").split("|");
        const packname = info[0] || "𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝕄𝔻";
        const author = info[1] || "𝟚𝟚𝟟";

        await monarque.sendMessage(chatId, { react: { text: "🛡️", key: m.key } });

        const buffer = await monarque.downloadMediaMessage(m);

        const sMetadata = new Sticker(buffer, {
            pack: packname,
            author: author,
            type: StickerTypes.FULL,
            quality: 70
        });

        await monarque.sendMessage(chatId, { sticker: await sMetadata.toBuffer() }, { quoted: m });

    } catch (err) {
        await monarque.sendMessage(chatId, { text: "❌ Impossible de modifier ce sticker." });
    }
};

export default take;
