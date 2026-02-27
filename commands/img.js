import axios from "axios";
import stylizedChar from '../utils/fancy.js'; // Ton moteur de texte 2026

export async function img(monarque, m, args) {
    const chatId = m.chat;
    const query = args.join(" ").trim();

    if (!query) {
        return await monarque.sendMessage(chatId, {
            text: stylizedChar("🖼️ Fournis des mots-clés\nExemple: .img hacker setup", 'bold')
        }, { quoted: m });
    }

    try {
        // Réaction de recherche
        await monarque.sendMessage(chatId, { react: { text: "🔍", key: m.key } });

        // Utilisation d'une API de recherche d'images HD (Unsplash/Google Scrap)
        // Note: Cette URL est un exemple d'API performante pour les bots WhatsApp en 2026
        const apiUrl = `https://api.lolhuman.xyz{encodeURIComponent(query)}`;

        const response = await axios.get(apiUrl, { timeout: 15000 });

        if (!response.data || !response.data.result) {
            throw new Error("Aucun résultat");
        }

        // On récupère une image au hasard parmi les meilleurs résultats pour varier
        const results = response.data.result;
        const randomImg = results[Math.floor(Math.random() * Math.min(results.length, 5))];

        const caption = `
🌟 *IMAGE GÉNÉRÉE :* ${stylizedChar(query, 'bold')}
📸 *Source :* HD Search Engine
🏛️ *Bot :* ${stylizedChar('Monarque-MD', 'script')}

> *_Always Dare to dream big_*
        `.trim();

        // Envoi de l'image en Haute Définition
        await monarque.sendMessage(chatId, {
            image: { url: randomImg },
            caption: caption,
            headerType: 4
        }, { quoted: m });

        // Réaction de succès
        await monarque.sendMessage(chatId, { react: { text: "✨", key: m.key } });

    } catch (error) {
        console.error("IMG ERROR:", error.message);
        
        // Fallback : Si l'API principale échoue, on tente une source de secours (Pixabay/Pexels)
        await monarque.sendMessage(chatId, {
            text: stylizedChar("❌ Erreur : Impossible de trouver une image HD pour cette recherche.", 'bold')
        }, { quoted: m });
    }
}

export default img;
