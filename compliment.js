// compliment.js
module.exports = {
  nom: '!compliment',
  description: 'Recevoir un compliment',
  execute: (message) => {
    const compliments = [
      'Tu es incroyable ! 😊',
      'Tu es super ! 👍',
      'Tu es vraiment génial ! 🎉',
      'Tu es une personne exceptionnelle ! 💕',
'Tu es incroyable tel que tu es !',
    'Tu as un sens de l'humour génial !',
    'Tu es incroyablement attentionné et gentil.',
    'Tu es plus puissant que tu ne le crois.',
    'Tu illumines la pièce !',
    'Tu es un vrai ami.',
    'Tu m'inspires !',
    'Tu es intelligent comme le roi noir Léonidas.',
    'Tu as un cœur en or.',
    'Tu fais une différence dans le monde.',
    'Ta positivité est contagieuse !',
    'Tu as une éthique de travail incroyable.',
    'Tu fais ressortir le meilleur chez les autres.',
    'Ton sourire illumine la journée de tout le monde.',
    'Tu es doué dans tout ce que tu fais.',
    'Ta gentillesse rend le monde meilleur.',
    'Tu as une perspective unique et merveilleuse.',
    'Ton enthousiasme est vraiment inspirant !',
    'Tu es capable d’accomplir de grandes choses.',
    'Tu sais toujours comment rendre quelqu’un spécial.',
    'Ta confiance est admirable.',
    'Tu as une belle âme.',
    'Ta générosité n’a pas de limites.',
    'Tu as un œil exceptionnel pour les détails.',
    'Ta passion est vraiment motivante !',
    'Tu es un(e) auditeur(trice) exceptionnel(le).',
    'Tu es plus fort(e) que tu ne le penses !',
    'Ton rire est contagieux.',
    'Tu as un don naturel pour valoriser les autres.',
    'Tu rends le monde meilleur simplement en étant là.'
];
    const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
    message.reply(randomCompliment);
  }
};