import axios from 'axios';

// Liste des catégories SFW 2025 (Plus sélectives et haute qualité)
const CATEGORIES = [
    'waifu', 'maid', 'marin-kitagawa', 'mori-calliope', 'raiden-shogun', 
    'oppai', 'selfies', 'uniform', 'kamisato-ayaka'
];

const waifu = async (monarque, m, args) => {
    try {
        const chatId = m.key.remoteJid;
        
        // Extraction propre de l'argument
        let choice = (Array.isArray(args) ? args[0] : args)?.toLowerCase();
        
        // Si pas de choix ou invalide, on prend 'waifu' par défaut
        if (!choice || !CATEGORIES.includes(choice)) {
            choice = 'waifu';
        }

        // Réaction de chargement stylisée
        await monarque.sendMessage(chatId, { react: { text: "✨", key: m.key } });

        // ✅ API WAIFU.IM 2025 : Version plus stable et rapide
        const apiUrl = `https://api.waifu.im{choice}&is_nsfw=false`;
        
        const res = await axios.get(apiUrl, {
            timeout: 10000,
            headers: { 'Accept-Encoding': 'gzip,deflate,compress' }
        });

        // Vérification du format de réponse de Waifu.im (objet images[])
        const imageData = res.data.images?.[0];

        if (!imageData || !imageData.url) {
            return await monarque.sendMessage(chatId, { 
                text: `❌ *Désolé*, aucune image trouvée pour : ${choice.toUpperCase()}` 
            }, { quoted: m });
        }

        // Envoi de l'image avec ton style Monarque 227
        await monarque.sendMessage(chatId, {
            image: { url: imageData.url },
            caption: `🎭 *𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝔸𝕟𝕚𝕞𝕖* : ${choice.toUpperCase()}\n\n> Always Dare to dream big\n*𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝟚𝟚𝟟*`
        }, { quoted: m });

        // Réaction de succès
        await monarque.sendMessage(chatId, { react: { text: "📸", key: m.key } });

    } catch (error) {
        console.error('[WAIFU 2025 ERROR]:', error.message);
        const chatId = m.key.remoteJid;
        
        // Système de secours (Fallback) vers Waifu.pics si Waifu.im est en maintenance
        try {
            const backup = await axios.get(`https://api.waifu.pics`);
            await monarque.sendMessage(chatId, {
                image: { url: backup.data.url },
                caption: `🎭 *𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝔸ani𝕞𝕖 (Backup)* : WAIFU`
            }, { quoted: m });
        } catch (e) {
            await monarque.sendMessage(chatId, { 
                text: `⚠️ *Erreur Réseau* : Les serveurs d'images sont saturés.` 
            }, { quoted: m });
        }
    }
};

export default waifu;
