import axios from 'axios';

const play = async (monarque, m, args) => {
    const chatId = m.key.remoteJid;
    const query = args.join(" ");

    if (!query) return await monarque.sendMessage(chatId, { text: "⚠️ Quelle chanson cherches-tu ?\nEx: `.play Ninho - No Love`" });

    try {
        await monarque.sendMessage(chatId, { react: { text: "🎧", key: m.key } });

        // Utilisation d'une API de recherche et téléchargement (Ex: Y2mate ou alternative 2026)
        const searchRes = await axios.get(`https://api.vkrdown.com{encodeURIComponent(query)}`);
        const video = searchRes.data.data[0]; // On prend le premier résultat

        if (!video) throw new Error("Aucun résultat");

        const downloadUrl = `https://api.vkrdown.com{video.url}`;
        const dlRes = await axios.get(downloadUrl);

        await monarque.sendMessage(chatId, {
            audio: { url: dlRes.data.data.audio },
            mimetype: 'audio/mp4',
            ptt: false, // false pour un fichier audio, true pour un vocal
            caption: `🎵 *𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝕄𝕦𝕤𝕚𝕔* : ${video.title}`
        }, { quoted: m });

        await monarque.sendMessage(chatId, { react: { text: "🎵", key: m.key } });

    } catch (err) {
        console.error(err);
        await monarque.sendMessage(chatId, { text: "❌ Impossible de lire cette musique." });
    }
};

export default play;
            
