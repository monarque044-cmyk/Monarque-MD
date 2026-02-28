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
import animeNew from '../commands/animeNew.js'

async function handleIncomingMessage(client, event) {
    try {
        const number = client.user.id.split(':')[0];
        const messages = event.messages;
        const config = configmanager.config.users[number];
        const prefix = config.prefix;
        const publicMode = config.publicMode;
        const approvedUsers = config.sudoList;
        // Correction lid syntaxe
        const lid = client?.user?.lid ? client.user.lid.split(':')[0] + '@lid' : '';

        for (const message of messages) {
            if (!message.message || message.key.fromMe) continue;

            const remoteJid = message.key.remoteJid;
            const messageBody = (
                message.message?.extendedTextMessage?.text ||
                message.message?.conversation || 
                ''
            ).trim();

            const isSudo = approvedUsers.includes(message.key.participant || remoteJid) || (lid && lid.includes(message.key.participant || remoteJid));

            // --- 1. RÉPONSE AUTOMATIQUE QUIZ ---
            if (triviaGames[remoteJid] && !isNaN(messageBody) && messageBody.length < 3) {
                await quiz.execute(client, message, [messageBody.toLowerCase()]);
                continue; 
            }

            // --- 2. LOGIQUE DES COMMANDES ---
            if (!messageBody.startsWith(prefix)) {
                auto.autotype(client, message);
                auto.autorecord(client, message);
                tag.respond(client, message);
                reactions.auto(client, message, config.autoreact, config.emoji);
                continue;
            }

            if (!publicMode && !message.key.fromMe && !isSudo) continue;

            const parts = messageBody.slice(prefix.length).trim().split(/\s+/);
            const commandName = parts.shift().toLowerCase();
            const args = parts; 

            // --- 3. MAPPAGE DES COMMANDES ---
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
                    await react(client, message); 
                    if (command.execute && typeof command.execute === 'function') {
                        await command.execute(client, message, args);
                    } else if (typeof command === 'function') {
                        await command(client, message, args);
                    }
                } catch (error) {
                    console.error(`[EXECUTION ERROR - ${commandName}]:`, error);
                    await client.sendMessage(remoteJid, { 
                        text: `👑 *Monarque Error* : Problème lors de l'exécution de \`${commandName}\`.` 
                    }, { quoted: message });
                }
            }
        }
    } catch (globalError) {
        console.error('[GLOBAL HANDLER ERROR]:', globalError);
    }
}

// ✅ AJOUT DE L'EXPORTATION MANQUANTE
export default handleIncomingMessage;
