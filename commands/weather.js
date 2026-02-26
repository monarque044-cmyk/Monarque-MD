import axios from 'axios';

export default async function weather(client, message) {
    const chatId = message.chat;
    
    // Extraction des arguments (tout ce qui suit la commande .weather)
    // On part du principe que message.body contient le texte complet
    const args = message.body ? message.body.split(' ').slice(1) : [];
    const city = args.join(' ');

    if (!city) {
        return client.sendMessage(chatId, { 
            text: '❌ Usage : .weather <ville>\nExemple : .weather Paris' 
        }, { quoted: message });
    }

    try {
        const apiKey = '4902c0f2550f58298ad4146a92b65e10'; 
        const response = await axios.get(
            `https://api.openweathermap.org{encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=fr`
        );

        const w = response.data;
        
        // Construction du message
        const weatherText = `
🌆 *Météo pour :* ${w.name}, ${w.sys.country}
🌡 *Température :* ${w.main.temp}°C
☁ *Conditions :* ${w.weather[0].description}
💨 *Vent :* ${w.wind.speed} m/s
💧 *Humidité :* ${w.main.humidity}%
        `.trim();

        await client.sendMessage(chatId, { text: weatherText }, { quoted: message });

    } catch (err) {
        console.error('❌ weather command error:', err);
        
        let errorMsg = '❌ Impossible de récupérer la météo.';
        if (err.response?.status === 404) {
            errorMsg = `❌ La ville "${city}" est introuvable.`;
        }

        await client.sendMessage(chatId, { text: errorMsg }, { quoted: message });
    }
    }
                                          
