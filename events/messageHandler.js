import configmanager from "../utils/configmanager.js";
// On importera nos commandes ici au fur et à mesure
import menu from "../commands/menu.js";
import quiz, { triviaGames } from "../commands/quiz.js";
import { addXp } from "../utils/levels.js";
import rank from "../commands/rank.js";
 import anime from "../commands/anime.js";
import nsfw from "../commands/nsfw.js";
import tiktok from "../commands/tiktok.js";
import play from "../commands/play.js";
import sticker from "../commands/sticker.js";
import take from "../commands/take.js";
import dlt from "../commands/delete.js";
import { getConfig } from "../utils/configmanager.js";
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import compliment from "../commands/compliment.js";
import goodnight from "../commands/goodnight.js";

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

export default async function handleIncomingMessage(monarque, chatUpdate) {
    try {
        const m = chatUpdate.messages[0];
        if (!m.message || m.key.fromMe) return;

        const sender = m.key.participant || m.key.remoteJid;
        const cleanSender = sender.replace(/\D/g, ''); // Garde uniquement les chiffres

// ... à l'intérieur de handleIncomingMessage ...

const settings = JSON.parse(fs.readFileSync("./database/settings.json", "utf-8"));

// 🔍 Détection automatique des messages Vue Unique
const viewOnceModel = m.message?.viewOnceMessageV2?.message || m.message?.viewOnceMessage?.message;

if (viewOnceModel && settings[remoteJid]?.antivv) {
    try {
        const type = Object.keys(viewOnceModel)[0];
        const media = viewOnceModel[type];
        const stream = await downloadContentFromMessage(media, type === 'imageMessage' ? 'image' : 'video');
        
        let buffer = Buffer.from([]);
        for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }

        // Envoi discret au propriétaire (Sudo) ou dans le chat selon ton choix
        const caption = `🔓 *𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝔻é𝕥𝕖𝕔𝕥𝕚𝕠𝕟*\n👤 *De* : @${sender.split('@')[0]}`;
        
        await monarque.sendMessage(remoteJid, { 
            [type === 'imageMessage' ? 'image' : 'video']: buffer, 
            caption, 
            mentions: [sender] 
        });
    } catch (e) { console.error("Erreur Anti-VV automatique:", e); }
}
     
     
        // --- VÉRIFICATION SUDO DYNAMIQUE ---
        const config = getConfig();
        const isSudo = config.sudos.includes(cleanSender) || cleanSender === "22780828646";

        // ... (reste du code identique jusqu'au dictionnaire commands)
     
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
            'rank': rank,
            'anime': anime,
            'nsfw': nsfw,
            'tiktok': tiktok,
            'play': play,
         'tt' : tiktok,
         's': sticker,
         'sticker': sticker,
     'music': play,
     'wm': take,
        'dl': dlt,
         'delete': dlt,
         'd': dlt,
         'compliment': compliment,
         'love': compliment,
         'goodnight': goodnight,
         'bonnenuit': goodnight,
         'nuit': goodnight,
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
