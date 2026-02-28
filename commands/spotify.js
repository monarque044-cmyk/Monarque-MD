import axios from 'axios';

export default {
    name: 'spotify',
    alias: ['sp', 'music', 'song'],
    category: 'Download',
    description: 'Télécharge une musique depuis Spotify',
    usage: '.spotify <titre/artiste>',

    async execute(monarque, m, args) {
        // ✅ Correction de l'extraction du Chat ID et de l'User
        const chatId = m.chat || m.key.remoteJid;
        const query = args.join(' ').trim();

        if (!query) {
            return await monarque.sendMessage(chatId, {
                text: '❌ *Usage:* .spotify <titre ou artiste>\n*Exemple:* .spotify Ninho Jefe'
            }, { quoted: m });
        }

        try {
            await monarque.sendMessage(chatId, { text: `👑 *Monarque* recherche : _"${query}"_...` }, { quoted: m });

            const apiUrl = `https://okatsu-rolezapiiz.vercel.app{encodeURIComponent(query)}`;
            const response = await axios.get(apiUrl, { timeout: 20000 });

            if (!response.data || !response.data.result) {
                return await monarque.sendMessage(chatId, { text: '❌ Aucun résultat trouvé sur Spotify.' }, { quoted: m });
            }

            const track = response.data.result;
            const audioUrl = track.audio || track.download || track.url || track.link;
            const coverUrl = track.thumbnails || track.image || track.cover;

            if (!audioUrl) {
                return await monarque.sendMessage(chatId, { text: '❌ Lien de téléchargement indisponible pour ce titre.' }, { quoted: m });
            }

            const caption = `🎧 *MONARQUE SPOTIFY* 🎧\n\n` +
                            `🎵 *Titre :* ${track.title || track.name || 'Inconnu'}\n` +
                            `👤 *Artiste :* ${track.artist || 'Inconnu'}\n` +
                            `⏱️ *Durée :* ${track.duration || 'N/A'}\n\n` +
                            `👑 *Statut :* Envoi en cours...`.trim();

            // 1. Envoi de l'image (Cover)
            if (coverUrl) {
                await monarque.sendMessage(chatId, { 
                    image: { url: coverUrl }, 
                    caption: caption 
                }, { quoted: m });
            } else {
                await monarque.sendMessage(chatId, { text: caption }, { quoted: m });
            }

            // 2. Envoi de l'audio (Format MP3)
            await monarque.sendMessage(chatId, {
                audio: { url: audioUrl },
                mimetype: 'audio/mpeg',
                fileName: `${track.title || 'Monarque_Music'}.mp3`,
                ptt: false 
            }, { quoted: m });

        } catch (error) {
            console.error('[SPOTIFY ERROR]:', error.message);
            await monarque.sendMessage(chatId, {
                text: '⚠️ *Erreur Monarque* : Le service est saturé ou le lien est mort.'
            }, { quoted: m });
        }
    }
};
