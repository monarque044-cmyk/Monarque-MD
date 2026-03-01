import axios from 'axios';

/**
 * 🌤️ COMMANDE MÉTÉO - MONARQUE MD
 * Utilise ta clé API OpenWeatherMap
 */

const API_KEY = "1007fa5c50135370a3f6cb0e751831c7"; 

const weather = async (monarque, m, args) => {
    try {
        const chatId = m.key.remoteJid;
        const city = args.join(" ");

        if (!city) {
            return await monarque.sendMessage(chatId, { text: "⚠️ Précise une ville !\nEx: `.weather Niamey` ou `.weather Paris`" });
        }

        // Réaction de recherche
        await monarque.sendMessage(chatId, { react: { text: "☁️", key: m.key } });

        const url = `https://api.openweathermap.org{encodeURIComponent(city)}&units=metric&lang=fr&appid=${API_KEY}`;
        
        const res = await axios.get(url, { timeout: 10000 });
        const data = res.data;

        // Traduction des types de météo en Emojis
        const icons = {
            "Clear": "☀️", "Clouds": "☁️", "Rain": "🌧️", "Drizzle": "🌦️",
            "Thunderstorm": "⛈️", "Snow": "❄️", "Mist": "🌫️", "Smoke": "💨", "Haze": "🌫️"
        };
        const emoji = icons[data.weather[0].main] || "🌍";

        let message = `🌤️ *𝕄é𝕥é𝕠 𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 : ${data.name}* (${data.sys.country})\n\n`;
        message += `${emoji} *Ciel* : ${data.weather[0].description}\n`;
        message += `🌡️ *Température* : ${Math.round(data.main.temp)}°C\n`;
        message += `🌡️ *Ressenti* : ${Math.round(data.main.feels_like)}°C\n`;
        message += `💧 *Humidité* : ${data.main.humidity}%\n`;
        message += `💨 *Vent* : ${Math.round(data.wind.speed * 3.6)} km/h\n\n`;
        message += `> Always Dare to dream big\n*𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝟚𝟚𝟟*`;

        await monarque.sendMessage(chatId, { 
            text: message,
            contextInfo: {
                externalAdReply: {
                    title: `Météo actuelle : ${data.name}`,
                    body: `Ciel : ${data.weather[0].description}`,
                    mediaType: 1,
                    thumbnailUrl: `https://openweathermap.org{data.weather[0].icon}@2x.png`,
                    sourceUrl: "" 
                }
            }
        }, { quoted: m });

        await monarque.sendMessage(chatId, { react: { text: "✅", key: m.key } });

    } catch (err) {
        console.error("[WEATHER ERROR]:", err.message);
        const chatId = m.key.remoteJid;
        
        let errorMsg = "❌ Ville introuvable ou service saturé.";
        if (err.response?.status === 401) errorMsg = "❌ Erreur de clé API. Vérifie ta config.";
        
        await monarque.sendMessage(chatId, { text: errorMsg });
    }
};

export default weather;
                                   
