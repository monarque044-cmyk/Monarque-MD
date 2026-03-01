import connectToWhatsapp from './shadow.js';
import handleIncomingMessage from './events/messageHandler.js';

async function start() {
    console.log('⏳ Lancement du moteur Monarque MD...');
    try {
        const monarque = await connectToWhatsapp();
        
        // On écoute les nouveaux messages
        monarque.ev.on('messages.upsert', async (chatUpdate) => {
            await handleIncomingMessage(monarque, chatUpdate);
        });

    } catch (e) {
        console.error('❌ Erreur au démarrage :', e);
    }
}

start();
