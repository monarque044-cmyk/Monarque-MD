import axios from 'axios';

const CATEGORIES = ['waifu', 'maid', 'marin-kitagawa', 'mori-calliope', 'raiden-shogun', 'oppai', 'selfies', 'uniform'];

const anime = async (monarque, m, args) => {
    try {
        const chatId = m.key.remoteJid;
        let choice = args[0]?.toLowerCase();
        
        if (!choice || !CATEGORIES.includes(choice)) choice = 'waifu';

        await monarque.sendMessage(chatId, { react: { text: "✨", key: m.key } });

        const res = await axios.get(`https://api.waifu.im{choice}&is_nsfw=false`);
        const image = res.data.images[0].url;

        await monarque.sendMessage(chatId, {
            image: { url: image },
            caption: `🎭 *𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝔸𝕟𝕚𝕞𝕖* : ${choice.toUpperCase()}\n\n> Always Dare to dream big`
        }, { quoted: m });

    } catch (err) {
        await monarque.sendMessage(m.key.remoteJid, { text: "❌ Erreur API Anime." });
    }
};

export default anime;
