import configmanager from "../utils/configmanager.js"
import fs from 'fs/promises'
import group from '../commands/group.js'
import block from '../commands/block.js'
import viewonce from '../commands/viewonce.js'
import tiktok from '../commands/tiktok.js'
import play from '../commands/play.js'
import sudo from '../commands/sudo.js'
import tag from '../commands/tag.js'
import take from '../commands/take.js'
import sticker from '../commands/sticker.js'
import img from '../commands/img.js'
import url from '../commands/url.js'
import sender from '../commands/sender.js'
import fuck from '../commands/fuck.js'
import bug from '../commands/bug.js'
import dlt from '../commands/dlt.js'
import save from '../commands/save.js'
import pp from '../commands/pp.js'
import premiums from '../commands/premiums.js'
import reactions from '../commands/reactions.js'
import media from '../commands/media.js'
import set from '../commands/set.js'
import fancy from '../commands/fancy.js'
import react from "../utils/react.js"
import info from "../commands/menu.js"
import { pingTest } from "../commands/ping.js"
import auto from '../commands/auto.js'
import uptime from '../commands/uptime.js'
import compliment from '../commands/compliment.js'
import weather from '../commands/weather.js'
import goodnight from '../commands/goodnight.js'
import antidemote from '../commands/antidemote.js'
import quiz, { triviaGames } from '../commands/quiz.js'
import spotify from '../commands/spotify.js'
import nsfw from '../commands/nsfw.js'
import waifu from '../commands/waifu.js'
import transcribe from '../commands/transcribe.js'
import rpg from '../commands/rpg.js'
import animenew from '../commands/animenew.js'

async function handleIncomingMessage(client, event) {
    try {
        const number = client.user.id.split(':')[0];
        const messages = event.messages;
        
        const config = configmanager.config.users[number] || { prefix: '.', publicMode: true, sudoList: [] };
        const prefix = config.prefix || '.';
        const publicMode = config.publicMode ?? true;
        const approvedUsers = config.sudoList || [];
        
        const ownerNumber = "22780828646"; // Ton numéro de maître

        for (const m of messages) {
            if (!m.message) continue;

            const remoteJid = m.key.remoteJid;
            const senderJid = m.key.participant || remoteJid;

            // ✅ NETTOYAGE CHIRURGICAL DE L'ID (Garde uniquement les chiffres)
            const cleanSender = senderJid.replace(/\D/g, '');

            const messageBody = (
                m.message?.conversation || 
                m.message?.extendedTextMessage?.text || 
                m.message?.imageMessage?.caption || 
                m.message?.videoMessage?.caption || 
                ''
            ).trim();

            if (!messageBody) continue;

            // ✅ VÉRIFICATION SUDO ABSOLUE (Compare les chiffres purs)
            const isSudo = approvedUsers.some(u => u.includes(ownerNumber)) || 
                           cleanSender === ownerNumber || 
                           m.key.fromMe === true;

            // ✅ LOG DE DIAGNOSTIC (Très important pour surveiller)
            console.log(`[MONARQUE] De: ${cleanSender} | Sudo: ${isSudo} | Message: "${messageBody.substring(0, 20)}..."`);

            // --- 1. RÉPONSE AUTOMATIQUE QUIZ ---
            // --- 1. RÉPONSE AUTOMATIQUE QUIZ MONARQUE ---
// On vérifie si un jeu est en cours dans ce groupe/chat
if (triviaGames[remoteJid]) {
    // Si l'utilisateur envoie juste un chiffre (1 à 4) ou la réponse exacte
    const isNumber = !isNaN(messageBody) && messageBody.length === 1;
    const game = triviaGames[remoteJid];

    // On redirige vers la fonction execute du quiz pour vérification
    if (isNumber || messageBody.toLowerCase() === game.correctAnswer.toLowerCase()) {
        await info.execute(client, m, [messageBody.toLowerCase()]);
        return; // On arrête ici pour ne pas traiter d'autres commandes
    }
}
            
            // --- 2. LOGIQUE DES COMMANDES ---
            if (!messageBody.startsWith(prefix)) {
                auto.autotype(client, m);
                auto.autorecord(client, m);
                tag.respond(client, m);
                reactions.auto(client, m, config.autoreact, config.emoji);
                continue;
            }

            // Si le bot n'est pas en mode public et que l'user n'est pas sudo, on ignore
            if (!publicMode && !isSudo) {
                console.log(`[SÉCURITÉ] Commande ignorée pour ${cleanSender}`);
                continue;
            }

            const parts = messageBody.slice(prefix.length).trim().split(/\s+/);
            const commandName = parts.shift().toLowerCase();
            const args = parts; 

            const commands = {
                'uptime': uptime, 'compliment': compliment, 'goodnight': goodnight,
                'weather': weather, 'antidemote': antidemote, 'quiz': quiz, 
                'trivia': quiz, 'spotify': spotify, 'sp': spotify, 'music': spotify,
                'song': spotify, 'nsfw': nsfw, 'hentai': nsfw, 'waifu': waifu,
                'transcribe': transcribe, 'rpg': rpg, 'profile': rpg, 'me': rpg,
                'statut': rpg, 'animenew': animeNew, 'newsanime': animeNew,
                'ping': pingTest, 'menu': info, 'help': info, 'fancy': fancy,
                'take': take, 'setpp': pp.setpp, 'getpp': pp.getpp, 'sudo': sudo.sudo,
                'delsudo': sudo.delsudo, 'public': set.isPublic, 'setprefix': set.setprefix,
                'sticker': sticker, 's': sticker, 'img': img, 'tiktok': tiktok, 
                'tt': tiktok, 'play': play
            };

            const command = commands[commandName];

            if (command) {
                try {
                    await react(client, m); 
                    if (command.execute && typeof command.execute === 'function') {
                        await command.execute(client, m, args);
                    } else if (typeof command === 'function') {
                        await command(client, m, args);
                    }
                } catch (error) {
                    console.error(`[COMMAND ERROR]:`, error);
                }
            }
        }
    } catch (globalError) {
        console.error('[GLOBAL HANDLER ERROR]:', globalError);
    }
}

export default handleIncomingMessage;
                                        
