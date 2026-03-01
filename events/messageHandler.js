import configmanager from "../utils/configmanager.js";

// On importera nos commandes ici au fur et à mesure
import menu from "../commands/menu.js";

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
