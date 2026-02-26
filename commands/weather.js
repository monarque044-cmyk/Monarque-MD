import axios from 'axios';

export default async function weather(client, message) {
    // On sécurise la récupération du Chat ID et du Texte
    const chatId = message.chat || message.key?.remoteJid;
    const msgText = message.body || message.message?.conversation || message.message?.extendedTextMessage?.text || "";
    
    const args = msgText.split(' ').slice(1);
    const city = args.join(' ');

    if (!city) {
        return client.sendMessage(chatId, { 
            text: '❌ *Usage :* .weather <ville>\nExemple : .weather Paris' 
        }, { quoted: message });
    }

    try {
        const apiKey = '4902c0f2550f58298ad4146a92b65e10'; 
        // ⚠️ CORRECTION DE L'URL CI-DESSOUS
        const response = await axios.get(
            `https://api.openweathermap.org{encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=fr`
        );

        const w = response.data;
        
        const weatherText = `
🌆 *Météo pour :* ${w.name}, ${w.sys.country}
🌡 *Température :* ${w.main.temp}°C
☁ *Conditions :* ${w.weather[0].description}
💨 *Vent :* ${w.wind.speed} m/s
💧 *Humidité :* ${w.main.humidity}%
        `.trim();

        await client.sendMessage(chatId, { text: weatherText }, { quoted: message });

    } catch (err) {
        console.error('❌ weather command error:', err.message);
        
        let errorMsg = '❌ Impossible de récupérer la météo. Réessaie plus tard.';
        if (err.response?.status === 404) {
            errorMsg = `❌ La ville "${city}" est introuvable. Vérifie l'orthographe !`;
        } else if (err.response?.status === 401) {
            errorMsg = `❌ Erreur de clé API. Vérifie ta configuration OpenWeather.`;
        }

        await client.sendMessage(chatId, { text: errorMsg }, { quoted: message });
    }
}
