import axios from 'axios';

const CATEGORIES = [
    'waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 
    'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 
    'highfive', 'handhold', 'nom', 'bite', 'glomp', 'slap', 'kill', 'happy', 
    'wink', 'poke', 'dance', 'cringe'
];

const waifu = async (monarque, m, args) => {
    const chatId = m.key.remoteJid;
    try {
        // ✅ Correction : On prend le premier argument du tableau
        let choice = Array.isArray(args) ? args[0] : args;
        choice = choice?.toLowerCase().trim();
        
        if (!choice || !CATEGORIES.includes(choice)) {
            choice = 'waifu';
        }

        await monarque.sendMessage(chatId, { react: { text: "✨", key: m.key } });

        // ✅ Utilisation de Waifu.pics (Plus stable pour les catégories simples comme neko)
        const apiUrl = `https://api.waifu.pics{choice}`;
        
        const res = await axios.get(apiUrl, { timeout: 10000 });

        if (!res.data || !res.data.url) {
            throw new Error("Pas de data");
        }

        await monarque.sendMessage(chatId, {
            image: { url: res.data.url },
            caption: `🎭 *𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝔸𝕟𝕚𝕞𝕖* : ${choice.toUpperCase()}\n\n> Always Dare to dream big\n*𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝟚𝟚𝟟*`
        }, { quoted: m });

        await monarque.sendMessage(chatId, { react: { text: "📸", key: m.key } });

    } catch (error) {
        console.error('[WAIFU ERROR]:', error.message);
        // Si l'API principale échoue, on tente un dernier secours fixe
        try {
            const fallback = await axios.get("https://api.waifu.pics");
            await monarque.sendMessage(chatId, {
                image: { url: fallback.data.url },
                caption: `🎭 *𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝔸𝕟𝕚𝕞𝕖 (Secours)*\n\n_L'API demandée était instable._`
            }, { quoted: m });
        } catch (e) {
            await monarque.sendMessage(chatId, { 
                text: `⚠️ *Erreur Réseau* : Impossible de joindre les APIs d'images.\n_Détails: ${error.message}_` 
            }, { quoted: m });
        }
    }
};

export default waifu;
