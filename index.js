import connectToWhatsapp from './shadow.js';

async function start() {
    console.log('⏳ Lancement du moteur Monarque MD...');
    try {
        const monarque = await connectToWhatsapp();
        
        monarque.ev.on('messages.upsert', async (m) => {
            // Ici nous placerons plus tard le handler de commandes
            console.log('📥 Nouveau message reçu !');
        });
    } catch (e) {
        console.error('❌ Erreur au démarrage :', e);
    }
}

start();
