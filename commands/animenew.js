import axios from 'axios';

// Fonction pour traduire sommairement les statuts Jikan
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
        try {
            const chatId = m.key.remoteJid;
            // On transforme les arguments en texte (ex: .animenew naruto)
            const query = Array.isArray(args) ? args.join(' ') : args;

            await monarque.sendMessage(chatId, { react: { text: "🔍", key: m.key } });

            let apiUrl = "";
            let isSearch = false;

            // Si l'utilisateur a écrit quelque chose après la commande
            if (query && query.trim().length > 0) {
                apiUrl = `https://api.jikan.moe{encodeURIComponent(query)}&limit=1`;
                isSearch = true;
            } else {
                // Sinon, on affiche le TOP de la saison
                apiUrl = `https://api.jikan.moe`;
            }

            const res = await axios.get(apiUrl, { timeout: 10000 });
            const data = res.data.data;

            if (!data || (Array.isArray(data) && data.length === 0)) {
                return await monarque.sendMessage(chatId, { text: `❌ Aucun résultat trouvé sur Monarque pour : *${query}*` }, { quoted: m });
            }

            let finalMessage = "";
            let imageUrl = "";

            if (isSearch) {
                // --- AFFICHAGE RECHERCHE UNIQUE ---
                const anime = Array.isArray(data) ? data[0] : data; 
                imageUrl = anime.images.jpg.large_image_url;
                
                finalMessage = `💮 *𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝔸𝕟𝕚𝕞𝕖 : ${anime.title_japanese || anime.title}*\n\n`;
                finalMessage += `📝 *Titre :* ${anime.title}\n`;
                finalMessage += `⭐ *Score :* ${anime.score || 'N/A'}/10\n`;
                finalMessage += `📺 *Épisodes :* ${anime.episodes || '??'}\n`;
                finalMessage += `📡 *Statut :* ${translateStatus(anime.status)}\n`;
                finalMessage += `📅 *Saison :* ${anime.season ? anime.season.toUpperCase() : 'Inconnue'} ${anime.year || ''}\n\n`;
                finalMessage += `📖 *Synopsis :* ${anime.synopsis ? anime.synopsis.substring(0, 300) + '...' : 'Aucun résumé disponible.'}\n\n`;
            } else {
                // --- AFFICHAGE TOP 5 ---
                imageUrl = data[0].images.jpg.large_image_url; 
                finalMessage = `🔥 *𝕋𝕠𝕡 𝔸𝕟𝕚𝕞𝕖𝕤 𝕕𝕦 𝕄𝕠𝕞𝕖𝕟𝕥*\n\n`;
                data.forEach((anime, i) => {
                    finalMessage += `*${i + 1}.* ${anime.title}\n⭐ Score: ${anime.score} | 📺 Eps: ${anime.episodes || '??'}\n\n`;
                });
                finalMessage += `_Astuce : Tape_ \`.animenew [nom]\` _pour une recherche précise._`;
            }

            finalMessage += `\n\n> Always Dare to dream big\n*𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝟚𝟚𝟟*`;

            await monarque.sendMessage(chatId, {
                image: { url: imageUrl },
                caption: finalMessage
            }, { quoted: m });

            await monarque.sendMessage(chatId, { react: { text: "💮", key: m.key } });

        } catch (error) {
            console.error('[ANIME ERROR]:', error.message);
            const chatId = m.key.remoteJid;
            await monarque.sendMessage(chatId, { 
                text: `❌ *Erreur Monarque* : Le service Jikan est saturé.\n_Détails: ${error.message}_` 
            }, { quoted: m });
        }
    }
};

// ✅ IMPORTANT : L'export doit correspondre au nom importé dans ton handler
export default animenew;
                                                         
