import axios from 'axios';
import stylizedChar from '../utils/fancy.js';

export default {
    name: 'weather',
    alias: ['meteo', 'forecast'],
    category: 'Utils',
    description: 'Météo actuelle, heure locale et prévisions sur 3 jours',

    async execute(monarque, m, args) {
        const chatId = m.chat;
        const city = args.join(' ');

        if (!city) return monarque.sendMessage(chatId, { text: '❌ *Usage :* .weather <ville>\n_Exemple: .weather Paris_' }, { quoted: m });

        try {
            // 1. TA CLÉ API INSÉRÉE ICI
            const apiKey = '1007fa5c50135370a3f6cb0e751831c7'; 
            
            // 2. Appel pour la météo actuelle
            const currentRes = await axios.get(`https://api.openweathermap.org{encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=fr`);
            const w = currentRes.data;

            // 3. Appel pour les prévisions (Forecast)
            const forecastRes = await axios.get(`https://api.openweathermap.org{encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=fr`);
            const f = forecastRes.data.list;

            // Calcul de l'heure locale de la ville
            const localTime = new Date(new Date().getTime() + (new Date().getTimezoneOffset() * 60000) + (w.timezone * 1000));
            const formatTime = localTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

            // Extraction des prévisions sur 3 jours (un point toutes les 24h)
            let forecastTxt = `\n\n📅 *PRÉVISIONS 3 JOURS :*`;
            for (let i = 8; i <= 24; i += 8) { 
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

> _Propulsé par Monarque-MD_
            `.trim();

            // Envoi de l'image de l'état actuel avec les infos
            await monarque.sendMessage(chatId, { 
                image: { url: `https://openweathermap.org{w.weather[0].icon}@4x.png` }, 
                caption: weatherText 
            }, { quoted: m });

        } catch (err) {
            console.error('Erreur Weather:', err.message);
            const msg = err.response?.status === 404 
                ? `❌ La ville "${city}" est introuvable. Vérifie l'orthographe !` 
                : `❌ Erreur : Ta clé API est peut-être encore en cours d'activation. Réessaie dans 1 heure.`;
            
            await monarque.sendMessage(chatId, { text: msg }, { quoted: m });
        }
    }
};
                
