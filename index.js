import connectToWhatsapp from './Momo/shadow.js';
import handleIncomingMessage from './events/messageHandler.js';
import antidemote from './commands/antidemote.js';

try {
    console.log('⏳ Initialisation du système Monarque MD...');

    // ✅ Top-level await : plus besoin de s'envelopper dans (async () => { ... })()
    const monarque = await connectToWhatsapp(handleIncomingMessage);

    if (!monarque || !monarque.ev) {
        throw new Error("L'instance de connexion n'a pas pu être récupérée.");
    }

    console.log('✅ Monarque MD : Connexion établie avec succès !');

    // --- Gestion des événements de groupe ---
    monarque.ev.on('group-participants.update', async (update) => {
        try {
            // Vérification de sécurité avant l'appel
            if (antidemote && typeof antidemote.onUpdate === 'function') {
                await antidemote.onUpdate(monarque, update);
            }
        } catch (error) {
            console.error('❌ Erreur critique dans Anti-demote:', error);
        }
    });

} catch (error) {
    console.error('❌ ÉCHEC DU DÉMARRAGE :', error.message);
    process.exit(1); // Arrête le processus proprement en cas d'erreur fatale
}
