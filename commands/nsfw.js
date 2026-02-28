import axios from 'axios';

// ✅ Liste des catégories NSFW disponibles sur waifu.pics
const NSFW_CATEGORIES = ['waifu', 'neko', 'trap', 'blowjob', 'hentai', 'milf', 'oral', 'paizuri', 'ecchi', 'ero'];

const nsfw = async (monarque, m, args) => {
    const chatId = m.key.remoteJid;
    
    // 1. Déterminer la catégorie (premier mot après la commande ou hasard)
    let choice = args[0]?.toLowerCase();
    
    if (!choice || !NSFW_CATEGORIES.includes(choice)) {
        choice = 'waifu'; // Catégorie par défaut si l'entrée est invalide
    }

    try {
        // Réaction d'avertissement
        await monarque.sendMessage(chatId, { react: { text: "🔞", key: m.key } });

        // 2. Appel à l'API (Correction : dossier /nsfw/ et syntaxe ${})
        const res = await axios.get(`https://api.waifu.pics{choice}`, {
            timeout: 15000
        });

        if (!res?.data?.url) {
            return monarque.sendMessage(chatId, { text: '❌ Impossible de récupérer l\'image NSFW.' }, { quoted: m });
        }

        // 3. Envoi de l'image avec légende
        await monarque.sendMessage(
            chatId,
            {
                image: { url: res.data.url },
                caption: `🔞 *𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 ℕ𝕊𝔽𝕎* : ${choice.toUpperCase()}\n\n> *_Always Dare to dream big_*`
            },
            { quoted: m }
        );

        // Réaction de succès
        await monarque.sendMessage(chatId, { react: { text: "✅", key: m.key } });

    } catch (error) {
        console.error('[NSFW ERROR]:', error.message);
        await monarque.sendMessage(chatId, { text: '❌ Erreur : Contenu indisponible ou timeout.' }, { quoted: m });
    }
};

export default nsfw;
