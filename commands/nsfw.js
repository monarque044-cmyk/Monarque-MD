import axios from 'axios';

const NSFW_TYPES = ['hentai', 'ass', 'pgif', 'pussy', 'paizuri', 'thigh', 'boobs'];

const nsfw = async (monarque, m, args) => {
    try {
        const chatId = m.key.remoteJid;
        
        // Sécurité : On peut ajouter ici une vérification si le groupe est NSFW
        let choice = args[0]?.toLowerCase();
        if (!choice || !NSFW_TYPES.includes(choice)) choice = 'hentai';

        await monarque.sendMessage(chatId, { react: { text: "🔞", key: m.key } });

        const res = await axios.get(`https://nekobot.xyz{choice}`);
        
        await monarque.sendMessage(chatId, {
            image: { url: res.data.message },
            caption: `🔞 *𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 ℕ𝕊𝔽𝕎* : ${choice.toUpperCase()}\n\n> _Contenu réservé aux adultes_`
        }, { quoted: m });

    } catch (err) {
        await monarque.sendMessage(m.key.remoteJid, { text: "❌ Erreur API NSFW ou service saturé." });
    }
};

export default nsfw;
