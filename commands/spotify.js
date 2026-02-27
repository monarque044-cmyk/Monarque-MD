import axios from 'axios';

export default {
    name: 'spotify',
    alias: ['sp', 'music', 'song'],
    category: 'Download',
    description: 'Télécharge une chanson depuis Spotify (audio + info)',
    usage: '.spotify <titre/artiste>',

    async execute(monarque, m, args) {
        const chatId = m.chat;
        
        // On récupère la recherche via les arguments passés par ton handler
        const query = args.join(' ').trim();

        if (!query) {
            return await monarque.sendMessage(chatId, {
                text: '❌ *Usage:* .spotify <titre ou artiste>\n*Exemple:* .spotify Imagine Dragons Believer'
            }, { quoted: m });
        }

        try {
            // Petit message d'attente
            await monarque.sendMessage(chatId, { text: `⏳ _Recherche de "${query}" sur Spotify..._` }, { quoted: m });

            // Appel API Okatsu
            const apiUrl = `https://okatsu-rolezapiiz.vercel.app/search/spotify?q=${encodeURIComponent(query)}`;
            const { data } = await axios.get(apiUrl, { 
                timeout: 20000, 
                headers: { 'user-agent': 'Mozilla/5.0' } 
            });

            if (!data?.status || !data?.result) {
                throw new Error('Aucun résultat.');
            }

            const track = data.result;
            const audioUrl = track.audio || track.download || track.link; // Sécurité sur la clé de l'URL

            if (!audioUrl) {
                return await monarque.sendMessage(chatId, {
                    text: '❌ Aucun fichier audio trouvé pour ce titre.'
                }, { quoted: m });
            }

            // Construction de la légende stylisée
            const caption = `🎧 *SPOTIFY DOWNLOADER* 🎧\n\n` +
                            `🎵 *Titre:* ${track.title || track.name || 'Inconnu'}\n` +
                            `👤 *Artiste:* ${track.artist || 'Inconnu'}\n` +
                            `⏱ *Durée:* ${track.duration || 'N/A'}\n` +
                            `🔗 *Lien:* ${track.url || 'N/A'}\n\n` +
                            `*Propulsé par Monarque Bot*`.trim();

            // 1. Envoyer la Cover (Thumbnail) avec les infos
            if (track.thumbnails || track.image || track.cover) {
                const imageUrl = track.thumbnails || track.image || track.cover;
                await monarque.sendMessage(chatId, { image: { url: imageUrl }, caption }, { quoted: m });
            } else {
                await monarque.sendMessage(chatId, { text: caption }, { quoted: m });
            }

            // 2. Envoyer le fichier audio (en mode document pour ne pas perdre en qualité)
            await monarque.sendMessage(chatId, {
                audio: { url: audioUrl },
                mimetype: 'audio/mpeg',
                fileName: `${track.title || 'music'}.mp3`,
                ptt: false // Mettre à true si tu veux que ça apparaisse comme un vocal
            }, { quoted: m });

        } catch (error) {
            console.error('[SPOTIFY ERROR]:', error.message);
            await monarque.sendMessage(chatId, {
                text: '❌ Erreur : Impossible de récupérer cette musique. L\'API est peut-être saturée, réessaie plus tard.'
            }, { quoted: m });
        }
    }
};
