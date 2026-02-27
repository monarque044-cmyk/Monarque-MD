import axios from 'axios';

// Liste des catégories SFW disponibles sur l'API waifu.pics
const CATEGORIES = ['waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 'highfive', 'handhold', 'nom', 'bite', 'glomp', 'slap', 'kill', 'happy', 'wink', 'poke', 'dance', 'cringe'];

export default {
  name: 'waifu',
  alias: ['anime', 'girl'],
  category: 'Anime',
  description: '💖 Envoie une image anime par catégorie',
  usage: '.waifu <catégorie>\nExemples: .waifu neko, .waifu megumin',

  async execute(monarque, m, args) {
    const chatId = m.chat;
    
    // 1. Déterminer la catégorie (choix de l'user ou hasard)
    let choice = args[0]?.toLowerCase();
    if (!choice || !CATEGORIES.includes(choice)) {
        choice = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    }

    try {
      // Réaction de chargement
      await monarque.sendMessage(chatId, { react: { text: "⏳", key: m.key } });

      // 2. Appel à l'API avec la catégorie choisie
      const res = await axios.get(`https://api.waifu.pics{choice}`, {
        timeout: 15000
      });

      if (!res?.data?.url) {
        return monarque.sendMessage(chatId, { text: '❌ Impossible de récupérer l\'image.' }, { quoted: m });
      }

      // 3. Envoi de l'image stylisée
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
  }
};
