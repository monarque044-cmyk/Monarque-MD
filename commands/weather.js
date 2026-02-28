import axios from 'axios';
import stylizedChar from '../utils/fancy.js';

// ✅ Export direct de la fonction
const weather = async (monarque, m, args) => {
    const chatId = m.key.remoteJid;
    const city = Array.isArray(args) ? args.join(' ') : args;

    if (!city) {
        return await monarque.sendMessage(chatId, { 
            text: '❌ *Usage :* .weather <ville>\n_Exemple: .weather Niamey_' 
        }, { quoted: m });
    }

    try {
        const apiKey = '1007fa5c50135370a3f6cb0e751831c7'; 
        
        // ✅ URLs API CORRIGÉES
        const currentUrl = `https://api.openweathermap.org{encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=fr`;
        const forecastUrl = `https://api.openweathermap.org{encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=fr`;

        const currentRes = await axios.get(currentUrl);
        const w = currentRes.data;

        const forecastRes = await axios.get(forecastUrl);
        const f = forecastRes.data.list;

        // Calcul de l'heure locale
        const localTime = new Date(new Date().getTime() + (new Date().getTimezoneOffset() * 60000) + (w.timezone * 1000));
        const formatTime = localTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        // Extraction des prévisions (3 jours)
        let forecastTxt = `\n\n📅 *PRÉVISIONS 3 JOURS :*`;
        for (let i = 8; i <= 24; i += 8) { 
            if (!f[i]) break;
            const day = f[i];
            const date = new Date(day.dt * 1000).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
            forecastTxt += `\n• *${date} :* ${Math.round(day.main.temp)}°C | ${day.weather[0].description}`;
        }

        const weatherText = `
🌍 *MÉTÉO : ${w.name.toUpperCase()}* (${w.sys.country})
⏰ *Heure locale :* ${formatTime}

🌡️ *Température :* ${w.main.temp}°C
☁️ *Conditions :* ${w.weather[0].description}
💧 *Humidité :* ${w.main.humidity}%
💨 *Vent :* ${w.wind.speed} m/s
${forecastTxt}

> _Propulsé par Monarque-MD_`.trim();

        // ✅ URL ICONE CORRIGÉE
        const iconUrl = `https://openweathermap.org{w.weather[0].icon}@4x.png`;

        await monarque.sendMessage(chatId, { 
            image: { url: iconUrl }, 
            caption: weatherText 
        }, { quoted: m });

    } catch (err) {
        console.error('❌ Erreur Weather:', err.message);
        const errorMsg = err.response?.status === 404 
            ? `❌ La ville "${city}" est introuvable. Vérifie l'orthographe !` 
            : `❌ Service météo indisponible ou erreur de clé API.`;
        
        await monarque.sendMessage(chatId, { text: errorMsg }, { quoted: m });
    }
};

export default weather;
