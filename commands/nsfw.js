import axios from 'axios';

const NSFW_CATEGORIES = ['waifu', 'neko', 'trap', 'blowjob', 'hentai', 'milf', 'oral', 'paizuri', 'ecchi', 'ero'];

export default {
    name: 'nsfw',
    description: 'Affiche du contenu adulte',
    
    async execute(monarque, m, args) { // <--- On ajoute la méthode execute
        const chatId = m.chat || m.key.remoteJid;
        
        let choice = args[0]?.toLowerCase();
        if (!choice || !NSFW_CATEGORIES.includes(choice)) {
            choice = 'waifu'; 
        }

        try {
            // URL Corrigée (il manquait le /nsfw/ dans votre template string)
            const res = await axios.get(`https://api.waifu.pics{choice}`, {
                timeout: 15000
            });

            if (!res?.data?.url) {
                return monarque.sendMessage(chatId, { text: '❌ Impossible de récupérer l\'image.' }, { quoted: m });
            }

            await monarque.sendMessage(chatId, {
                image: { url: res.data.url },
                caption: `🔞 *𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 ℕ𝕊𝔽𝕎* : ${choice.toUpperCase()}\n\n> *_Always Dare to dream big_*`
            }, { quoted: m });

        } catch (error) {
            console.error('[NSFW ERROR]:', error.message);
            await monarque.sendMessage(chatId, { text: '❌ Erreur : Service indisponible.' }, { quoted: m });
        }
    }
};
