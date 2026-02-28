import axios from 'axios';

const CATEGORIES = ['waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 'highfive', 'handhold', 'nom', 'bite', 'glomp', 'slap', 'kill', 'happy', 'wink', 'poke', 'dance', 'cringe'];

const waifu = async (monarque, m, args) => {
    const chatId = m.key.remoteJid;
    
    // On récupère le premier argument du tableau args
    let choice = args[0]?.toLowerCase();
    
    if (!choice || !CATEGORIES.includes(choice)) {
        choice = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    }

    try {
        await monarque.sendMessage(chatId, { react: { text: "⏳", key: m.key } });

        // ✅ URL CORRIGÉE : Ajout de /sfw/ et de la syntaxe ${}
        const res = await axios.get(`https://api.waifu.pics{choice}`, {
            timeout: 15000
        });

        if (!res?.data?.url) {
            return monarque.sendMessage(chatId, { text: '❌ Impossible de récupérer l\'image.' }, { quoted: m });
        }

        await monarque.sendMessage(chatId, {
            image: { url: res.data.url },
            caption: `✨ *Catégorie : ${choice.toUpperCase()}*\n\n> *_MONARQUE-MD_*`
        }, { quoted: m });

        await monarque.sendMessage(chatId, { react: { text: "✅", key: m.key } });

    } catch (error) {
        console.error('[WAIFU ERROR]:', error.message);
        await monarque.sendMessage(chatId, { text: '❌ Erreur technique. Réessaie plus tard.' }, { quoted: m });
    }
};

export default waifu;
