import axios from 'axios';

const NSFW_CATEGORIES = ['waifu', 'neko', 'trap', 'blowjob', 'hentai', 'milf', 'oral', 'paizuri', 'ecchi', 'ero'];

export default {
    name: 'nsfw',
    description: 'Affiche du contenu adulte',
    
    async execute(monarque, m, args) {
        // Correction du chatId pour éviter les crashs
        const chatId = m.chat || m.key?.remoteJid;
        
        // On récupère le premier argument (le choix de la catégorie)
        let choice = args[0]?.toLowerCase();
        
        if (!choice || !NSFW_CATEGORIES.includes(choice)) {
            choice = 'waifu'; 
        }

        try {
            // ✅ URL FIXÉE : Ajout de /nsfw/ et correction de la syntaxe ${choice}
            const apiUrl = `https://api.waifu.pics{choice}`;
            
            const res = await axios.get(apiUrl, {
                timeout: 15000,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });

            if (!res?.data?.url) {
                return await monarque.sendMessage(chatId, { text: '❌ Impossible de récupérer l\'image.' }, { quoted: m });
            }

            // Envoi du contenu
            await monarque.sendMessage(chatId, {
                image: { url: res.data.url },
                caption: `🔞 *𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 ℕ𝕊𝔽𝕎* : ${choice.toUpperCase()}\n\n> *_Always Dare to dream big_*`
            }, { quoted: m });

        } catch (error) {
            console.error('[NSFW ERROR]:', error.message);
            await monarque.sendMessage(chatId, { 
                text: `❌ *Erreur Monarque* : Impossible de joindre l'API.\n_Détails: ${error.message}_` 
            }, { quoted: m });
        }
    }
};
