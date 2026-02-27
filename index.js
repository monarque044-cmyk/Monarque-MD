import connectToWhatsapp from './Momo/shadow.js';
import handleIncomingMessage from './events/messageHandler.js';
import antidemote from './commands/antidemote.js';

(async () => {
    // 1. On récupère l'instance du bot (monarque) renvoyée par ta fonction de connexion
    const monarque = await connectToWhatsapp(handleIncomingMessage);
    
    console.log('✅ Monarque MD : Connection established !');

    // 2. Maintenant que 'monarque' est défini, on peut écouter les événements
    monarque.ev.on('group-participants.update', async (update) => {
        try {
            // On appelle la fonction de protection Anti-demote
            await antidemote.onUpdate(monarque, update);
        } catch (error) {
            console.error('❌ Erreur Anti-demote:', error);
        }
    });

})();
