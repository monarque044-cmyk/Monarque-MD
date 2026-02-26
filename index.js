import connectToWhatsapp from './Monarque/MD.js'
import handleIncomingMessage from './events/messageHandler.js'

(async() => {
    await connectToWhatsapp(handleIncomingMessage)
        console.log('established !')
})()

const complimentCommand = require('./compliment.js');

// index.js
const helpCommand = require('./help.js');

// ...

const commandes = [
  helpCommand,
  // ajoute d'autres commandes ici
];

// ...

client.on('message', message => {
  const cmd = commandes.find(c => c.nom === message.body);
  if (cmd) {
    cmd.execute(message, commandes);
  }
});

// index.js
const antibotCommand = require('./antibot.js');