import axios from 'axios';

const translateStatus = (status) => {
    const map = { 
        "Finished Airing": "Terminé", 
        "Currently Airing": "En cours", 
        "Not yet aired": "À venir" 
    };
    return map[status] || status;
};

const animenew = {
    name: 'animenew',
    description: 'Recherche d\'anime ou Top du moment',

    async execute(monarque, m, args) {
        const chatId = m.key.remoteJid;
        try {
            // ✅ Correction extraction arguments
            const query = Array.isArray(args) ? args.join(' ') : args;

            await monarque.sendMessage(chatId, { react: { text: "🔍", key: m.key } });

            let apiUrl = "";
            let isSearch = false;

            if (query && query.trim().length > 0) {
                // ✅ FIX : Utilisation des backticks (`) et de la bonne syntaxe ${encodeURIComponent}
                apiUrl = `https://api.jikan.moe{encodeURIComponent(query)}&limit=1`;
                isSearch = true;
            } else {
                apiUrl = `https://api.jikan.moe`;
            }

            const res = await axios.get(apiUrl, { timeout: 10000 });
            const data = res.data.data;

            if (!data || (Array.isArray(data) && data.length === 0)) {
                return await monarque.sendMessage(chatId, { text: `❌ Aucun résultat pour : *${query}*` }, { quoted: m });
            }

            let finalMessage = "";
            let imageUrl = "";

            if (isSearch) {
                // --- MODE RECHERCHE ---
                const anime = Array.isArray(data) ? data[0] : data; 
                imageUrl = anime.images.jpg.large_image_url; // ✅ Extraction de l'image
                
                finalMessage = `💮 *𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝔸𝕟𝕚𝕞𝕖 : ${anime.title_japanese || anime.title}*\n\n`;
                finalMessage += `📝 *Titre :* ${anime.title}\n`;
                finalMessage += `⭐ *Score :* ${anime.score || 'N/A'}/10\n`;
                finalMessage += `📺 *Épisodes :* ${anime.episodes || '??'}\n`;
                finalMessage += `📡 *Statut :* ${translateStatus(anime.status)}\n`;
                finalMessage += `📅 *Saison :* ${anime.season ? anime.season.toUpperCase() : 'Inconnue'} ${anime.year || ''}\n\n`;
                finalMessage += `📖 *Synopsis :* ${anime.synopsis ? anime.synopsis.substring(0, 300) + '...' : 'Aucun résumé.'}\n\n`;
            } else {
                // --- MODE TOP 5 ---
                imageUrl = data[0].images.jpg.large_image_url; // ✅ Image du premier du top
                finalMessage = `🔥 *𝕋𝕠𝕡 𝔸𝕟𝕚𝕞𝕖𝕤 𝕕𝕦 𝕄𝕠𝕞𝕖𝕟𝕥*\n\n`;
                data.forEach((anime, i) => {
                    finalMessage += `*${i + 1}.* ${anime.title}\n⭐ Score: ${anime.score} | 📺 Eps: ${anime.episodes || '??'}\n\n`;
                });
                finalMessage += `_Utilise_ \`.animenew [nom]\` _pour chercher._`;
            }

            finalMessage += `\n\n> Always Dare to dream big\n*𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝟚𝟚𝟟*`;

            // ✅ ENVOI DE L'IMAGE AVEC LA LÉGENDE
            await monarque.sendMessage(chatId, {
                image: { url: imageUrl },
                caption: finalMessage
            }, { quoted: m });

            await monarque.sendMessage(chatId, { react: { text: "💮", key: m.key } });

        } catch (error) {
            console.error('[ANIME ERROR]:', error.message);
            await monarque.sendMessage(chatId, { 
                text: `❌ *Erreur Monarque* : Service Jikan indisponible.\n_Détails: ${error.message}_` 
            }, { quoted: m });
        }
    }
};

export default animenew;
