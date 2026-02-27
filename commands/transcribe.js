import axios from 'axios';
import FormData from 'form-data';

export default {
    name: 'transcribe',
    alias: ['audio2text', 'lire'],
    category: 'Utils',
    description: 'Transforme un message vocal en texte écrit (IA Whisper)',
    usage: 'Répondez à un vocal avec .transcribe',

    async execute(monarque, m) {
        const chatId = m.chat;

        // 1. Vérification : l'utilisateur répond-il à un audio ?
        const quoted = m.quoted ? m.quoted : m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const isAudio = quoted?.audioMessage || m.message?.audioMessage;

        if (!isAudio) {
            return monarque.sendMessage(chatId, { text: '❌ *Erreur :* Veuillez répondre à un *message vocal* avec la commande `.transcribe`.' }, { quoted: m });
        }

        try {
            // Petite réaction pour dire "Je travaille..."
            await monarque.sendMessage(chatId, { react: { text: "✍️", key: m.key } });

            // 2. Téléchargement de l'audio depuis WhatsApp
            // Utilise la fonction native de ton bot pour télécharger le média
            const buffer = await monarque.downloadMediaMessage(m.quoted ? m.quoted : m);

            // 3. Envoi à l'API Gratuite Groq (Whisper V3)
            const apiKey = 'gsk_S6IomfEicWq21G6zFqW3WGdyb3FYM389N29U23U0Y23U0Y23U0'; // ⚠️ REMPLACE PAR TA CLÉ GROQ ICI
            
            const formData = new FormData();
            formData.append('file', buffer, { filename: 'audio.ogg', contentType: 'audio/ogg' });
            formData.append('model', 'whisper-large-v3');
            formData.append('language', 'fr'); // Force la détection en Français

            const response = await axios.post('https://api.groq.com', formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${apiKey}`
                }
            });

            const textResult = response.data.text;

            if (!textResult) throw new Error("Transcription vide");

            // 4. Envoi du résultat final
            const resultMsg = `📝 *TRANSCRIPTION VOCALE* 📝\n\n“ ${textResult} ”\n\n_Généré par Monarque-MD_`;
            
            await monarque.sendMessage(chatId, { text: resultMsg }, { quoted: m });
            await monarque.sendMessage(chatId, { react: { text: "✅", key: m.key } });

        } catch (error) {
            console.error('❌ Transcribe Error:', error.response?.data || error.message);
            
            let errorText = "❌ Impossible de transcrire l'audio.";
            if (error.response?.status === 401) errorText = "❌ Erreur : Clé API Groq invalide ou expirée.";
            
            await monarque.sendMessage(chatId, { text: errorText }, { quoted: m });
            await monarque.sendMessage(chatId, { react: { text: "⚠️", key: m.key } });
        }
    }
};
      
