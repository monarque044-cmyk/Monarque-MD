import axios from 'axios';

export default async function weather(client, message) {
    try {
        // 1. Sécurisation des données entrantes
        const chatId = message.chat || message.key?.remoteJid;
        if (!chatId) return;

        const msgText = message.body || 
                        message.message?.conversation || 
                        message.message?.extendedTextMessage?.text || 
                        "";
        
        const args = msgText.split(' ').slice(1);
        const city = args.join(' ');

        if (!city) {
            return client.sendMessage(chatId, { 
                text: '❌ *Usage :* .weather <ville>\nExemple : .weather Paris' 
            }, { quoted: message });
        }

        // 2. Appel à l'API avec URL CORRIGÉE
        const apiKey = '4902c0f2550f58298ad4146a92b65e10'; 
        const url = `https://api.openweathermap.org{encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=fr`;

        const response = await axios.get(url);
        const w = response.data;
        
        // 3. Construction du message (w.weather[0] est important ici)
        const weatherText = `
🌆 *Météo pour :* ${w.name}, ${w.sys.country}
🌡 *Température :* ${w.main.temp}°C
☁ *Conditions :* ${w.weather[0].description}
💨 *Vent :* ${w.wind.speed} m/s
💧 *Humidité :* ${w.main.humidity}%
        `.trim();

        await client.sendMessage(chatId, { text: weatherText }, { quoted: message });

    } catch (err) {
        // Empêche le bot de s'arrêter en cas d'erreur
        console.error('❌ Erreur commande Weather :', err.message);
        
        let errorMsg = '❌ Impossible de récupérer la météo.';
        
        if (err.response?.status === 404) {
            errorMsg = `❌ La ville "${args.join(' ')}" est introuvable.`;
        } else if (err.response?.status === 401) {
            errorMsg = `❌ Clé API invalide.`;
        }

        const chatId = message.chat || message.key?.remoteJid;
        await client.sendMessage(chatId, { text: errorMsg }, { quoted: message });
    }
}
