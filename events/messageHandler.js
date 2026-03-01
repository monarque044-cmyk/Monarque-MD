import configmanager from "../utils/configmanager.js";
// On importera nos commandes ici au fur et à mesure
import menu from "../commands/menu.js";
import quiz, { triviaGames } from "../commands/quiz.js";
import { addXp } from "../utils/levels.js";

export default async function handleIncomingMessage(monarque, chatUpdate) {
    try {
        const m = chatUpdate.messages[0];
        if (!m.message || m.key.fromMe) return;

        const remoteJid = m.key.remoteJid;
        const sender = m.key.participant || remoteJid;
        const pushName = m.pushName || "Utilisateur";

        // Récupération du message (Texte, Image, Vidéo, etc.)
        const messageBody = (
            m.message?.conversation || 
            m.message?.extendedTextMessage?.text || 
            m.message?.imageMessage?.caption || 
            m.message?.videoMessage?.caption || 
            ''
        ).trim();

// ... (dans handleIncomingMessage) ...
// ✅ DÉTECTION DES RÉPONSES AU QUIZ
if (triviaGames[remoteJid]) {
    const game = triviaGames[remoteJid];
    const userChoice = parseInt(messageBody);

    if (!isNaN(userChoice) && userChoice >= 1 && userChoice <= 4) {
        if (userChoice === game.correctIndex) {
            await monarque.sendMessage(remoteJid, { text: `✅ *BRAVO !*\nLa réponse était bien : *${game.correctAnswer}*\n🌟 +50 XP` });
            // Ici tu peux ajouter la logique de sauvegarde des scores JSON
        } else {
            await monarque.sendMessage(remoteJid, { text: `❌ *MAUVAIS !*\nLa réponse était : *${game.correctAnswer}*` });
        }
        delete triviaGames[remoteJid]; // On arrête le jeu
        return; 

// ... (dans le bloc triviaGames[remoteJid]) ...
if (userChoice === game.correctIndex) {
    const { level, leveledUp } = addXp(sender, 50); // +50 XP par bonne réponse
    
    let winMsg = `✅ *BRAVO @${sender.split('@')[0]} !*\n`;
    winMsg += `🌟 +50 XP | Total Niveau : *${level}*\n`;
    
    if (leveledUp) {
        winMsg += `\n🎊 *LEVEL UP !* Tu es maintenant niveau *${level}* !`;
    }
    
    await monarque.sendMessage(remoteJid, { text: winMsg, mentions: [sender] });
}
    }
}

        // Configuration (Préfixe et Sudo)
        const prefix = "."; 
        const ownerNumber = "22780828646";
        const isSudo = sender.includes(ownerNumber);

        if (!messageBody.startsWith(prefix)) return;

        // Découpage de la commande
        const args = messageBody.slice(prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();

        // --- DICTIONNAIRE DES COMMANDES ---
        const commands = {
            'menu': menu,
            'help': menu,
            // On ajoutera 'quiz', 'nsfw', 'animenew' ici plus tard
        };

        const command = commands[commandName];

        if (command) {
            console.log(`✨ [COMMAND] ${commandName} par ${pushName}`);
            // Exécution sécurisée
            if (typeof command === 'function') {
                await command(monarque, m, args);
            } else if (command.execute) {
                await command.execute(monarque, m, args);
            }
        }

    } catch (err) {
        console.error("❌ Erreur Handler :", err);
    }
}
