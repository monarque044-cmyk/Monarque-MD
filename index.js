import process from 'process';
import path from 'path';
import { fileURLToPath } from 'url';

// Force le bot à travailler à la racine pour trouver node_modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.chdir(__dirname); 

import connectToWhatsapp from './shadow.js'; // ✅ Chemin corrigé
import handleIncomingMessage from './events/messageHandler.js';

async function startMonarque() {
    try {
        console.log('⏳ Système Monarque MD : Initialisation...');

        const monarque = await connectToWhatsapp();

        if (!monarque) {
            throw new Error("Le socket n'a pas pu être initialisé.");
        }

        console.log('✅ Écoute des messages activée !');

        monarque.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                if (chatUpdate.type === 'notify' && chatUpdate.messages) {
                    await handleIncomingMessage(monarque, chatUpdate);
                }
            } catch (err) {
                console.error("❌ Erreur Handler :", err.message);
            }
        });

    } catch (error) {
        console.error('❌ ÉCHEC FATAL MONARQUE :', error.message);
        setTimeout(startMonarque, 10000); 
    }
}

startMonarque();
