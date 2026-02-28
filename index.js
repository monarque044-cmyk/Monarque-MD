import connectToWhatsapp from './Momo/shadow.js';
import handleIncomingMessage from './events/messageHandler.js';
import antidemote from './commands/antidemote.js';

/**
 * 🚀 Initialisation Monarque
 */
async function startMonarque() {
    try {
        console.log('⏳ Initialisation du système Monarque MD...');

        // 1. On attend que shadow.js nous donne le contrôle
        const monarque = await connectToWhatsapp();

        console.log('✅ Écoute des messages activée !');

        // --- 2. L'UNIQUE ÉCOUTEUR DE MESSAGES ---
        monarque.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                // ✅ LOG DE RÉCEPTION (Crucial pour le débug)
                if (chatUpdate.type === 'notify') {
                    console.log(`📥 Message reçu de: ${chatUpdate.messages[0].key.remoteJid}`);
                    
                    // On envoie au handler corrigé (Spotify, RPG, etc.)
                    await handleIncomingMessage(monarque, chatUpdate);
                }
            } catch (err) {
                console.error("❌ Erreur Handler :", err.message);
            }
        });

        // --- 3. ÉVÉNEMENTS DE GROUPE ---
        monarque.ev.on('group-participants.update', async (update) => {
            try {
                if (antidemote && typeof antidemote.onUpdate === 'function') {
                    await antidemote.onUpdate(monarque, update);
                }
            } catch (e) {}
        });

    } catch (error) {
        console.error('❌ ÉCHEC FATAL :', error.message);
        setTimeout(startMonarque, 10000); // Redémarrage auto en cas de crash
    }
}

startMonarque();
