import axios from 'axios';

const tiktok = async (monarque, m, args) => {
    const chatId = m.key.remoteJid;
    const url = args[0];

    if (!url || !url.includes("tiktok.com")) {
        return await monarque.sendMessage(chatId, { text: "⚠️ Peux-tu me donner un lien TikTok valide ?\nEx: `.tiktok https://vm.tiktok.com`" });
    }

    try {
        await monarque.sendMessage(chatId, { react: { text: "📥", key: m.key } });

        const res = await axios.get(`https://www.tikwm.com{url}`);
        const data = res.data.data;

        if (!data) throw new Error("Vidéo introuvable");

        await monarque.sendMessage(chatId, {
            video: { url: data.play },
            caption: `🎬 *𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝕋𝕚𝕜𝕋𝕠𝕜*\n👤 *Auteur* : ${data.author.nickname}\n📝 *Titre* : ${data.title}\n\n> Always Dare to dream big`,
            footer: "𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝟚𝟚𝟟"
        }, { quoted: m });

        await monarque.sendMessage(chatId, { react: { text: "✅", key: m.key } });

    } catch (err) {
        console.error(err);
        await monarque.sendMessage(chatId, { text: "❌ Erreur lors du téléchargement TikTok." });
    }
};

export default tiktok;
