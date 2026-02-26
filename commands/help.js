// help.js
module.exports = {
  nom: '!help',
  description: 'Afficher les commandes disponibles',
  execute: (message, commandes) => {
    const helpMessage = commandes.map(cmd => `${cmd.nom} - ${cmd.description}`).join('\n');
    message.reply(`Commandes disponibles :\n${helpMessage}`);
  }
};