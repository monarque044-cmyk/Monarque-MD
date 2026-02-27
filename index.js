import connectToWhatsapp from './Momo/shadow.js'
import handleIncomingMessage from './events/messageHandler.js'

(async() => {
    await connectToWhatsapp(handleIncomingMessage)
        console.log('established !')
})()

import antidemote from './commands/antidemote.js'; // Vérifie le chemin

// Dans ton bloc de connexion :
monarque.ev.on('group-participants.update', async (update) => {
    // On appelle la fonction de protection
    await antidemote.onUpdate(monarque, update);
});
