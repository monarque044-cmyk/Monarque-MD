import axios from 'axios';

export default {
    name: 'spotify',
    alias: ['sp', 'music', 'song'],
    category: 'Download',
    description: 'Télécharge une musique depuis Spotify',
    usage: '.spotify <titre/artiste>',

    async execute(monarque, m, args) {
        const chatId = m.chat;
        const query = args.join(' ').trim();

        if (!query) {
            return await monarque.sendMessage(chatId, {
                text: '❌ *Usage:* .spotify <titre ou artiste>\n*Exemple:* .spotify Ninho Jefe'
            }, { quoted: m });
        }

        try {
            await monarque.sendMessage(chatId, { text: `👑 *Monarque* recherche : _"${query}"_...` }, { quoted: m });

            // Appel à l'API Okatsu
            const apiUrl = `https://okatsu-rolezapiiz.vercel.app/search/spotify?q=${encodeURIComponent(query)}`;
            const response = await axios.get(apiUrl, { timeout: 20000 });

            // Sécurité : Vérification de la structure de réponse
            if (!response.data || !response.data.result) {
                return await monarque.sendMessage(chatId, { text: '❌ Aucun résultat trouvé sur Spotify.' }, { quoted: m });
            }

            const track = response.data.result;
            
            // On vérifie plusieurs sources possibles pour l'audio selon l'API
            const audioUrl = track.audio || track.download || track.url;
            const coverUrl = track.thumbnails || track.image || track.cover;

            if (!audioUrl) {
                return await monarque.sendMessage(chatId, { text: '❌ Lien de téléchargement indisponible.' }, { quoted: m });
            }

            const caption = `🎧 *MONARQUE SPOTIFY* 🎧\n\n` +
                            `🎵 *Titre :* ${track.title || track.name || 'Inconnu'}\n` +
                            `👤 *Artiste :* ${track.artist || 'Inconnu'}\n` +
                            `⏱️ *Durée :* ${track.duration || 'N/A'}\n` +
                            `👑 *Statut :* Prêt pour l'écoute`.trim();

            // 1. Envoi de l'image avec les infos
            if (coverUrl) {
                await monarque.sendMessage(chatId, { 
                    image: { url: coverUrl }, 
                    caption: caption 
                }, { quoted: m });
            } else {
                await monarque.sendMessage(chatId, { text: caption }, { quoted: m });
            }

            // 2. Envoi de l'audio (Audio standard)
            await monarque.sendMessage(chatId, {
                audio: { url: audioUrl },
                mimetype: 'audio/mpeg',
                fileName: `${track.title || 'Monarque_Music'}.mp3`,
                ptt: false 
            }, { quoted: m });

        } catch (error) {
            console.error('[SPOTIFY ERROR]:', error.message);
            await monarque.sendMessage(chatId, {
                text: '⚠️ *Erreur Monarque* : Le service est momentanément indisponible.'
            }, { quoted: m });
        }
    }
};
