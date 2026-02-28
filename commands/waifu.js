import axios from 'axios';

// ✅ Liste des catégories SFW disponibles
const CATEGORIES = ['waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 'highfive', 'handhold', 'nom', 'bite', 'glomp', 'slap', 'kill', 'happy', 'wink', 'poke', 'dance', 'cringe'];

// ✅ On exporte directement la fonction pour éviter "is not a function"
const waifu = async (monarque, m, args) => {
    // Correction : Utilisation de remoteJid pour plus de stabilité
    const chatId = m.key.remoteJid;
    
    // 1. Déterminer la catégorie (choix de l'user ou hasard)
    // On utilise args[0] car args est déjà un tableau venant du handler
    let choice = args[0]?.toLowerCase();
    
    if (!choice || !CATEGORIES.includes(choice)) {
        choice = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    }

    try {
        // Réaction de chargement
        await monarque.sendMessage(chatId, { react: { text: "⏳", key: m.key } });

        // 2. Appel à l'API (Correction de l'URL : ajout de /sfw/)
        const res = await axios.get(`https://api.waifu.pics{choice}`, {
            timeout: 15000
        });

        if (!res?.data?.url) {
            return monarque.sendMessage(chatId, { text: '❌ Impossible de récupérer l\'image.' }, { quoted: m });
        }

        // 3. Envoi de l'image
        await monarque.sendMessage(
            chatId,
            {
                image: { url: res.data.url },
                caption: `✨ *Catégorie : ${choice.toUpperCase()}*\n\n> *_MONARQUE-MD_*`
            },
            { quoted: m }
        );

        // Réaction de succès
        await monarque.sendMessage(chatId, { react: { text: "✅", key: m.key } });

    } catch (error) {
        console.error('[ANIME ERROR]:', error.message);
        await monarque.sendMessage(chatId, { text: '❌ Erreur technique. Réessaie plus tard.' }, { quoted: m });
    }
};

export default waifu;
