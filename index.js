import process from 'process';
import path from 'path';
import { fileURLToPath } from 'url';

// 🛠️ FORCE LA RACINE (Fixe l'erreur "Cannot find package")
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.chdir(__dirname); 

import connectToWhatsapp from './Momo/shadow.js';
import handleIncomingMessage from './events/messageHandler.js';
import antidemote from './commands/antidemote.js';

/**
 * 🚀 Initialisation Monarque
 */
async function startMonarque() {
    try {
        console.log('⏳ Système Monarque MD : Vérification des modules...');

        // 1. Connexion via shadow.js
        const monarque = await connectToWhatsapp();

        if (!monarque) {
            throw new Error("Le socket Monarque n'a pas pu être initialisé.");
        }

        console.log('✅ Écoute des messages activée !');

        // --- 2. L'UNIQUE ÉCOUTEUR DE MESSAGES ---
        monarque.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                if (chatUpdate.type === 'notify' && chatUpdate.messages[0]) {
                    // ✅ Envoi au handler (Quiz, Spotify, RPG, etc.)
                    await handleIncomingMessage(monarque, chatUpdate);
                }
            } catch (err) {
                console.error("❌ Erreur Handler :", err.message);
            }
        });

        // --- 3. ÉVÉNEMENTS DE GROUPE ---
        monarque.ev.on('group-participants.update', async (update) => {
            try {
                if (antidemote && typeof antidemote.execute === 'function') {
                    await antidemote.execute(monarque, update);
                }
            } catch (e) {
                // Erreur silencieuse pour les groupes
            }
        });

    } catch (error) {
        console.error('❌ ÉCHEC FATAL MONARQUE :', error.message);
        console.log('🔄 Tentative de redémarrage dans 10 secondes...');
        setTimeout(startMonarque, 10000); 
    }
}

// Lancement du bot
startMonarque();
    
