import connectToWhatsapp from './Momo/shadow.js';
import handleIncomingMessage from './events/messageHandler.js';
import antidemote from './commands/antidemote.js';

(async () => {
    try {
        console.log('⏳ Connexion en cours...');
        
        // Attend que la connexion soit officiellement 'open'
        const monarque = await connectToWhatsapp(handleIncomingMessage);
        
        console.log('✅ Monarque MD : Connection established !');

        // Gestion des événements de groupe
        monarque.ev.on('group-participants.update', async (update) => {
            try {
                // Vérifie que la fonction existe avant l'appel
                if (antidemote && typeof antidemote.onUpdate === 'function') {
                    await antidemote.onUpdate(monarque, update);
                }
            } catch (error) {
                console.error('❌ Erreur Anti-demote:', error);
            }
        });

    } catch (error) {
        console.error('❌ Erreur critique au démarrage :', error.message);
        process.exit(1); // Arrête le script en cas d'échec de connexion
    }
})();
