import configmanager from "../utils/configmanager.js"
import fs from 'fs/promises'
import group from '../commands/group.js'
import block from '../commands/block.js'
import viewonce from '../commands/viewonce.js'
//import kill from '../commands/kill.js'
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
import quiz, {triviaGames} from '../commands/quiz.js'
import spotify from '../commands/spotify.js'
import nsfw from '../commands/nsfw.js'
import waifu from '../commands/waifu.js'
import transcribe from '../commands/transcribe.js'
import rpg from '../commands/rpg.js'
import animeNew from '../commands/animeNew.js'

async function handleIncomingMessage(client, event) {
    let lid = client?.user?.lid.split(':')[0] + '@lid'
    const number = client.user.id.split(':')[0]
    const messages = event.messages
    const publicMode = configmanager.config.users[number].publicMode
    const prefix = configmanager.config.users[number].prefix
const triviaGames = {}; // ✅ Déclaration indispensable pour éviter l'erreur
    
    for (const message of messages) {
        const messageBody = (message.message?.extendedTextMessage?.text ||
                           message.message?.conversation || '').toLowerCase()
        const remoteJid = message.key.remoteJid
        const approvedUsers = configmanager.config.users[number].sudoList

        if (!messageBody || !remoteJid) continue

        console.log('📨 Message:', messageBody.substring(0, 50))
        
        auto.autotype(client, message)
        auto.autorecord(client, message)
        tag.respond(client, message)

        reactions.auto(
            client,
            message,
            configmanager.config.users[number].autoreact,
            configmanager.config.users[number].emoji
        )

        if (messageBody.startsWith(prefix) &&
            (publicMode ||
             message.key.fromMe ||
             approvedUsers.includes(message.key.participant || message.key.remoteJid) ||
             lid.includes(message.key.participant || message.key.remoteJid))) {

            const commandAndArgs = messageBody.slice(prefix.length).trim()
            const parts = commandAndArgs.split(/\s+/)
            const command = parts[0]

            // --- Bloc de réponse automatique au Quiz ---
// On utilise 'remoteJid' pour identifier le groupe et 'messageBody' pour la réponse
if (triviaGames[remoteJid] && !isNaN(messageBody.trim()) && messageBody.trim().length < 3) {
    const quizAnswer = [messageBody.trim()];
    // On utilise 'client' (ton socket) et 'message' (l'événement)
    await quiz.execute(client, message, quizAnswer);
    return; 
}
                        
            switch (command) {
                case 'uptime': // @cat: utils
                    await react(client, message)
                    await uptime(client, message)
                    break

                case 'compliment': // @cat: fun
                    await react(client, message)
                    await compliment(client, message)
                    break

                case 'goodnight': //@cat: fun
                    await react(client, message)
                    await goodnight(client, message)
                    break

                    case 'weather': // @cat: group
    await react(client, message);
    // On récupère les arguments (la ville) après la commande
    const weatherArgs = parts.slice(1); 
    // ✅ APPEL CORRIGÉ : On utilise .execute
    await weather.execute(client, message, weatherArgs);
    break
                    
                case 'antidemote': // @cat: group
                    await react(client, message)
                    await antidemote(client, message)
                    break

                case 'quiz': // @cat: fun
                    await react(client, message)
                    const quizAegs = part.slice(1);
                    await quiz.execute(client, message, Args)
                    break

                case 'spotify': // @cat group
                    await react(client, message)
                    await spotify(client, message)
                    break

                case 'nsfw': // @cat: anime
    await react(client, message);
    // On extrait les arguments (ex: le type de photo nsfw)
    const nsfwArgs = parts.slice(1); 
    // ✅ APPEL CORRIGÉ : On utilise .execute
    await nsfw.execute(client, message, nsfwArgs);
    break;
                    
                case 'waifu': // @cat: anime
                    await waifu(client, message, parts.slice(1));
                    break

                case 'transcribe': // @cat: group
                    await react(client, message)
                    await transcribe(client, message)
                    break

                case 'rpg': // @cat: group
                    await react(client, message)
                    await rpg(client, message)
                    break
                    
                case 'animeNew': // @cat: anime
                    await react(client, message)
                    await animeNew(client, message)
                    break

                case 'take': // @cat: group
                    await react(client, message)
                    await take(client, message)
                    break
                    
                case 'ping': // @cat: utils
                    await react(client, message)
                    await pingTest(client, message)
                    break

                case 'menu': // @cat: utils
                    await react(client, message)
                    await info(client, message)
                    break

                case 'fancy': // @cat: utils
                    await react(client, message)
                    await fancy(client, message)
                    break

                case 'setpp': // @cat: utils
                    await react(client, message)
                    await pp.setpp(client, message)
                    break

                case 'getpp': // @cat: utils
                    await react(client, message)
                    await pp.getpp(client, message)
                    break

                case 'sudo': // @cat: owner
                    await react(client, message)
                    await sudo.sudo(client, message, approvedUsers)
                    configmanager.save()
                    break

                case 'delsudo': // @cat: owner
                    await react(client, message)
                    await sudo.delsudo(client, message, approvedUsers)
                    configmanager.save()
                    break

                case 'public': // @cat: settings
                    await react(client, message)
                    await set.isPublic(message, client)
                    break

                case 'setprefix': // @cat: settings
                    await react(client, message)
                    await set.setprefix(message, client)
                    break

                case 'autotype': // @cat: settings
                    await react(client, message)
                    await set.setautotype(message, client)
                    break

                case 'autorecord': // @cat: settings
                    await react(client, message)
                    await set.setautorecord(message, client)
                    break

                case 'welcome': // @cat: settings
                    await react(client, message)
                    await set.setwelcome(message, client)
                    break

                case 'photo': // @cat: media
                    await react(client, message)
                    await media.photo(client, message)
                    break

                case 'toaudio': // @cat: media
                    await react(client, message)
                    await media.tomp3(client, message)
                    break

                case 'sticker': // @cat: media
                    await react(client, message)
                    await sticker(client, message)
                    break

                case 'play': // @cat: media
                    await react(client, message)
                    await play(message, client)
                    break

                case 'img': // @cat: media
                    await react(client, message)
                    await img(message, client)
                    break

                case 'vv': // @cat: media
                    await react(client, message)
                    await viewonce(client, message)
                    break

                case 'save': // @cat: media
                    await react(client, message)
                    await save(client, message)
                    break

                case 'tiktok': // @cat: media
                    await react(client, message)
                    await tiktok(client, message)
                    break

                case 'url': // @cat: media
                    await react(client, message)
                    await url(client, message)
                    break

                case 'tag': // @cat: group
                    await react(client, message)
                    await tag.tag(client, message)
                    break

                case 'tagall': // @cat: group
                    await react(client, message)
                    await tag.tagall(client, message)
                    break

                case 'tagadmin': // @cat: group
                    await react(client, message)
                    await tag.tagadmin(client, message)
                    break

                case 'kick': // @cat: group
                    await react(client, message)
                    await group.kick(client, message)
                    break

                case 'kickall': // @cat: group
                    await react(client, message)
                    await group.kickall(client, message)
                    break

                case 'kickall2': // @cat: group
                    await react(client, message)
                    await group.kickall2(client, message)
                    break

                case 'promote': // @cat: group
                    await react(client, message)
                    await group.promote(client, message)
                    break

                case 'demote': // @cat: group
                    await react(client, message)
                    await group.demote(client, message)
                    break

                case 'promoteall': // @cat: group
                    await react(client, message)
                    await group.pall(client, message)
                    break

                case 'demoteall': // @cat: group
                    await react(client, message)
                    await group.dall(client, message)
                    break

                case 'mute': // @cat: group
                    await react(client, message)
                    await group.mute(client, message)
                    break

                case 'unmute': // @cat: group
                    await react(client, message)
                    await group.unmute(client, message)
                    break

                case 'gclink': // @cat: group
                    await react(client, message)
                    await group.gclink(client, message)
                    break

                case 'antilink': // @cat: group
                    await react(client, message)
                    await group.antilink(client, message)
                    break

                case 'bye': // @cat: group
                    await react(client, message)
                    await group.bye(client, message)
                    break

                case 'block': // @cat: moderation
                    await react(client, message)
                    await block.block(client, message)
                    break

                case 'unblock': // @cat: moderation
                    await react(client, message)
                    await block.unblock(client, message)
                    break

                case 'close': // @cat: bug
                    await react(client, message)
                    await hell(client, message)
                    break

               // case 'kill': // @cat: bug
                  //  await react(client, message)
                  //  await kill(client, message)
                  //  break

                case 'fuck': // @cat: bug
                    await react(client, message)
                    await fuck(client, message)
                    break

                case 'addprem': // @cat: premium
    await react(client, message);
    await premiums.addprem(client, message);
    configmanager.saveP();
    break;

case 'delprem': // @cat: premium
    await react(client, message);
    await premiums.delprem(client, message);
    configmanager.saveP();
    break;

                case 'test': // @cat: creator
                    await react(client, message)
                    break

                case 'join': // @cat: group
                    await react(client, message)
                    await group.setJoin(client, message)
                    break

                case 'auto-promote': // @cat: premium
                    await react(client, message)
                    if (premium.includes(number + "@s.whatsapp.net")) {
                        await group.autoPromote(client, message)
                    } else {
                        await bug(client, message, "command only for premium users.", 3)
                    }
                    break

                case 'auto-demote': // @cat: premium
                    await react(client, message)
                    if (premium.includes(number + "@s.whatsapp.net")) {
                        await group.autoDemote(client, message)
                    } else {
                        await bug(client, message, "command only for premium users.", 3)
                    }
                    break

                case 'auto-left': // @cat: premium
                    await react(client, message)
                    if (premium.includes(number + "@s.whatsapp.net")) {
                        await group.autoLeft(client, message)
                    } else {
                        await bug(client, message, "command only for premium users.", 3)
                    }
                    break
            }
        }

        await group.linkDetection(client, message)
    }
}

export default handleIncomingMessage
