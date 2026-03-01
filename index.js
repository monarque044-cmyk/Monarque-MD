import connectToWhatsapp from './shadow.js';
import handleIncomingMessage from './events/messageHandler.js';

/**
 * 🚀 Initialisation Monarque MD (Version Katabump-Stable)
 */
async function startMonarque() {
    try {
        console.log('⏳ Système Monarque MD : Démarrage du moteur...');

        // 1. Connexion via shadow.js (Chemin direct sans process.chdir)
        const monarque = await connectToWhatsapp();

        if (!monarque) {
            throw new Error("Échec de l'initialisation du socket.");
        }

        console.log('✅ Écoute des messages activée !');

        // --- 2. GESTION DES MESSAGES ---
        monarque.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                if (chatUpdate.type === 'notify' && chatUpdate.messages) {
                    // Envoi au handler (Quiz, RPG, Spotify, etc.)
                    await handleIncomingMessage(monarque, chatUpdate);
                }
            } catch (err) {
                console.error("❌ Erreur Handler :", err.message);
            }
        });

    } catch (error) {
        console.error('❌ ÉCHEC FATAL MONARQUE :', error.message);
        console.log('🔄 Tentative de redémarrage dans 10 secondes...');
        setTimeout(startMonarque, 10000); 
    }
}

// Lancement direct
startMonarque();
