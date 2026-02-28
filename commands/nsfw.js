import axios from 'axios';

// Liste des catégories 2025 mise à jour (Images & GIFs)
const NSFW_CATEGORIES = [
    'hentai', 'ass', 'pgif', 'gonewild', 'thigh', 'pussy', 
    'paizuri', 'tentacle', 'boobs', 'hboobs', 'yaoi', 'yuri'
];

export default {
    name: 'nsfw',
    description: 'Affiche du contenu adulte premium 2025',
    
    async execute(monarque, m, args) {
        const chatId = m.key.remoteJid;
        
        // On récupère le choix ou 'hentai' par défaut
        let choice = args[0]?.toLowerCase();
        
        if (!choice || !NSFW_CATEGORIES.includes(choice)) {
            const list = NSFW_CATEGORIES.join(', ');
            return await monarque.sendMessage(chatId, { 
                text: `🔞 *𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 ℕ𝕊𝔽𝕎*\n\nCatégories valides :\n_${list}_` 
            }, { quoted: m });
        }

        try {
            // ✅ Utilisation de l'API NekoBot (Plus rapide et riche en 2025)
            const apiUrl = `https://nekobot.xyz{choice}`;
            
            const res = await axios.get(apiUrl, {
                timeout: 10000,
                headers: { 'User-Agent': 'MonarqueBot/2.0' }
            });

            if (!res?.data?.message) {
                throw new Error("Format de réponse invalide");
            }

            // Envoi du média (Image ou GIF)
            await monarque.sendMessage(chatId, {
                image: { url: res.data.message },
                caption: `🔞 *𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 ℕ𝕊𝔽𝕎* : ${choice.toUpperCase()}\n\n> Always Dare to dream big`
            }, { quoted: m });

        } catch (error) {
            console.error('[NSFW 2025 ERROR]:', error.message);
            
            // Système de secours (Fallback) vers Waifu.pics si NekoBot est saturé
            try {
                const backupUrl = `https://api.waifu.pics{choice === 'hentai' ? 'hentai' : 'waifu'}`;
                const backupRes = await axios.get(backupUrl);
                await monarque.sendMessage(chatId, {
                    image: { url: backupRes.data.url },
                    caption: `🔞 *𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 ℕ𝕊𝔽𝕎 (Backup)* : ${choice.toUpperCase()}`
                }, { quoted: m });
            } catch (e) {
                await monarque.sendMessage(chatId, { 
                    text: `❌ *Erreur Réseau* : Les serveurs adultes sont saturés.\n_Réessaye dans quelques secondes._` 
                }, { quoted: m });
            }
        }
    }
};
