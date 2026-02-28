import connectToWhatsapp from './Momo/shadow.js';
import handleIncomingMessage from './events/messageHandler.js';
import antidemote from './commands/antidemote.js';

async function startMonarque() {
    try {
        console.log('⏳ Initialisation du système Monarque MD...');

        // 1. Connexion au socket Baileys
        const monarque = await connectToWhatsapp();

        if (!monarque || !monarque.ev) {
            throw new Error("L'instance de connexion n'a pas pu être récupérée.");
        }

        console.log('✅ Monarque MD : Système prêt et écoute active !');

        // --- 2. ÉCOUTEUR DE MESSAGES (Avec Log de Diagnostic) ---
        monarque.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                // ✅ LOG DE TEST : S'affiche à chaque message reçu
                console.log(`📥 [LOG] Paquet reçu | Type: ${chatUpdate.type} | Nb messages: ${chatUpdate.messages?.length}`);

                // On ne traite que les nouveaux messages ("notify")
                if (chatUpdate.type === 'notify') {
                    await handleIncomingMessage(monarque, chatUpdate);
                }
            } catch (err) {
                console.error("❌ Erreur dans le Message Handler :", err.message);
            }
        });

        // --- 3. GESTION DES ÉVÉNEMENTS DE GROUPE ---
        monarque.ev.on('group-participants.update', async (update) => {
            try {
                if (antidemote && typeof antidemote.onUpdate === 'function') {
                    await antidemote.onUpdate(monarque, update);
                }
            } catch (error) {
                console.error('❌ Erreur critique dans Anti-demote:', error.message);
            }
        });

        // --- 4. GESTION DES ERREURS DE SOCKET ---
        monarque.ev.on('error', (err) => {
            console.error('⚠️ Erreur Socket Monarque:', err.message);
        });

    } catch (error) {
        console.error('❌ ÉCHEC FATAL DU DÉMARRAGE :', error.message);
        setTimeout(startMonarque, 10000);
    }
}

// Lancement du bot
startMonarque();
