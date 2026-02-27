import axios from 'axios';
import stylizedChar from '../utils/fancy.js'; // Ton moteur de texte 2026

export default {
    name: 'animenews',
    alias: ['newsanime', 'animetv'],
    category: 'Anime',
    description: '📰 Donne les dernières actualités d’un anime aléatoire',

    async execute(monarque, m) {
        const chatId = m.chat;

        try {
            // 1. Réaction de recherche
            await monarque.sendMessage(chatId, { react: { text: "🔍", key: m.key } });

            // 2. Récupération d'un anime populaire (Jikan API v4)
            const topRes = await axios.get('https://api.jikan.moe');
            const topData = topRes.data?.data;

            if (!topData || topData.length === 0) throw new Error('Pas de données Top Anime');

            // Choix aléatoire parmi le top 15
            const randomAnime = topData[Math.floor(Math.random() * topData.length)];
            const animeId = randomAnime.mal_id;
            const animeTitle = randomAnime.title_french || randomAnime.title;

            // 3. Récupération des actualités spécifiques à cet anime
            const newsRes = await axios.get(`https://api.jikan.moe/v4/anime/${animeId}/news`);
            const newsData = newsRes.data?.data;

            if (!newsData || newsData.length === 0) {
                return monarque.sendMessage(chatId, {
                    text: stylizedChar(`❌ Aucune actualité récente trouvée pour l'anime : ${animeTitle}.`)
                }, { quoted: m });
            }

            // 4. Construction de la liste (Top 3 pour éviter un message trop long)
            const newsList = newsData.slice(0, 3).map((item, index) => {
                const title = item.title || 'Sans titre';
                const link = item.url || '';
                const date = item.date ? new Date(item.date).toLocaleDateString('fr-FR') : 'Inconnue';
                
                return `🔹 ${index + 1}. *${title}*\n📅 ${date}\n🔗 ${link}`;
            }).join('\n\n');

            // 5. Envoi du message stylisé Monarque
            const header = stylizedChar(`✨ ACTUALITÉS : ${animeTitle.toUpperCase()} ✨`, 'bold');
            const footer = stylizedChar(`Powered by Monarque-MD`, 'script');

            const caption = `${header}\n\n${newsList}\n\n🎬 ${footer}`;

            await monarque.sendMessage(chatId, { 
                image: { url: randomAnime.images.jpg.large_image_url }, 
                caption: caption 
            }, { quoted: m });

            // Réaction de succès
            await monarque.sendMessage(chatId, { react: { text: "🗞️", key: m.key } });

        } catch (err) {
            console.error('❌ AnimeNews Error:', err.message);
            await monarque.sendMessage(chatId, { 
                text: stylizedChar('❌ Service temporairement indisponible. Réessaie plus tard.') 
            }, { quoted: m });
        }
    }
};
