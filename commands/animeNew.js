import axios from 'axios';
import stylizedChar from '../utils/fancy.js';

export default {
    name: 'animenews',
    alias: ['newsanime', 'animetv'],
    category: 'Anime',
    description: '📰 Donne les dernières actualités d’un anime aléatoire',

    async execute(monarque, m) {
        // Sécurité pour le chatId
        const chatId = m.chat || m.key.remoteJid;

        try {
            // 1. Réaction de recherche
            await monarque.sendMessage(chatId, { react: { text: "🔍", key: m.key } });

            // 2. ✅ CORRECTION : Endpoint correct pour le Top Anime
            // On récupère le top anime pour avoir une liste de départ
            const topRes = await axios.get('https://api.jikan.moe', { timeout: 10000 });
            const topData = topRes.data?.data;

            if (!topData || topData.length === 0) {
                throw new Error('Pas de données Top Anime');
            }

            // Choix aléatoire parmi les 25 premiers du top
            const randomAnime = topData[Math.floor(Math.random() * Math.min(topData.length, 25))];
            const animeId = randomAnime.mal_id;
            const animeTitle = randomAnime.title_french || randomAnime.title || "Anime Inconnu";

            // 3. Récupération des actualités (News)
            const newsRes = await axios.get(`https://api.jikan.moe/v4/anime/${animeId}/news`, { timeout: 10000 });
            const newsData = newsRes.data?.data;

            if (!newsData || newsData.length === 0) {
                return monarque.sendMessage(chatId, {
                    text: `❌ Aucune actualité récente trouvée pour : *${animeTitle}*.`
                }, { quoted: m });
            }

            // 4. Construction de la liste (Top 3)
            const newsList = newsData.slice(0, 3).map((item, index) => {
                const title = item.title || 'Sans titre';
                const link = item.url || 'Pas de lien';
                // Formatage simple de la date
                const date = item.date ? item.date.split('T')[0] : 'Inconnue';
                
                return `🔹 ${index + 1}. *${title}*\n📅 ${date}\n🔗 ${link}`;
            }).join('\n\n');

            // 5. Mise en forme Monarque
            // Note: Vérifiez que stylizedChar accepte bien deux arguments (texte, style)
            const header = `✨ ACTUALITÉS : ${animeTitle.toUpperCase()} ✨`;
            const footer = `Powered by Monarque-MD`;

            const caption = `👑 *${header}*\n\n${newsList}\n\n🎬 _${footer}_`;

            await monarque.sendMessage(chatId, { 
                image: { url: randomAnime.images.jpg.large_image_url }, 
                caption: caption 
            }, { quoted: m });

            // Réaction de succès
            await monarque.sendMessage(chatId, { react: { text: "🗞️", key: m.key } });

        } catch (err) {
            console.error('❌ AnimeNews Error:', err.message);
            await monarque.sendMessage(chatId, { 
                text: `❌ *Erreur Monarque* : Service Jikan indisponible.\n_(Erreur: ${err.message})_` 
            }, { quoted: m });
        }
    }
};
