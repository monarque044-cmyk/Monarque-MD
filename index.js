import connectToWhatsapp from './Momo/shadow.js';
import handleIncomingMessage from './events/messageHandler.js';
import antidemote from './commands/antidemote.js';

try {
    console.log('⏳ Initialisation du système Monarque MD...');

    // 1. Connexion au socket Baileys
    const monarque = await connectToWhatsapp();

    if (!monarque || !monarque.ev) {
        throw new Error("L'instance de connexion n'a pas pu être récupérée.");
    }

    console.log('✅ Monarque MD : Connexion établie avec succès !');

    // --- 2. ÉCOUTEUR DE MESSAGES (LE CŒUR DU BOT) ---
    monarque.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            // DEBUG : Décommente la ligne suivante si tu veux voir les messages bruts dans ta console
            // console.log("📥 Nouveau message détecté !", JSON.stringify(chatUpdate, null, 2));

            // On envoie le paquet de messages au handler que nous avons corrigé
            await handleIncomingMessage(monarque, chatUpdate);
        } catch (err) {
            console.error("❌ Erreur dans le Handler de Messages :", err);
        }
    });

    // --- Gestion des événements de groupe (Anti-demote) ---
    monarque.ev.on('group-participants.update', async (update) => {
        try {
            if (antidemote && typeof antidemote.onUpdate === 'function') {
                await antidemote.onUpdate(monarque, update);
            }
        } catch (error) {
            console.error('❌ Erreur critique dans Anti-demote:', error);
        }
    });

} catch (error) {
    console.error('❌ ÉCHEC DU DÉMARRAGE :', error.message);
    process.exit(1);
            }
    
