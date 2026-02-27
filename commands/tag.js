import { downloadMediaMessage } from "@whiskeysockets/baileys";
import configmanager from '../utils/configmanager.js';
import fs from 'fs';

// 1. TAG ALL : Mentionne tout le monde avec une liste visible
export async function tagall(monarque, message) {
    const chatId = message.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return;

    try {
        const metadata = await monarque.groupMetadata(chatId);
        const participants = metadata.participants.map(user => user.id);
        const list = participants.map(user => `@${user.split('@')[0]}`).join('\n');

        await monarque.sendMessage(chatId, {
            text: `╭─⌈ 🚀 *𝑍ᴇʀ⭕✞︎DIAS Broadcast* ⌋\n│\n${list}\n│\n╰─⌊ *Powered by Monarque-MD* ⌉`,
            mentions: participants
        }, { quoted: message });

    } catch (error) {
        console.error("Tagall error:", error);
    }
}

// 2. TAG ADMIN : Alerte uniquement les admins
export async function tagadmin(monarque, message) {
    const chatId = message.key.remoteJid;
    const botId = monarque.user.id.split(':')[0] + '@s.whatsapp.net';
    if (!chatId.endsWith('@g.us')) return;

    try {
        const { participants } = await monarque.groupMetadata(chatId);
        const admins = participants.filter(p => (p.admin === 'admin' || p.admin === 'superadmin') && p.id !== botId).map(p => p.id);
        
        if (admins.length === 0) return;

        const list = admins.map(user => `@${user.split('@')[0]}`).join('\n');
        const text = `╭─⌈ 🛡️ *𝑍ᴇʀ⭕✞︎DIAS Alert* ⌋\n│ *ADMINS ONLY*\n│\n${list}\n│\n╰─⌊ *MD227 Control* ⌉`;

        await monarque.sendMessage(chatId, { text, mentions: admins }, { quoted: message });

    } catch (error) {
        console.error("Tagadmin error:", error);
    }
}

// 3. RESPOND : Envoie l'audio si tu es tagué (Correction LID/JID)
export async function respond(monarque, message) {
    const myNumber = monarque.user.id.split(':')[0];
    const chatId = message.key.remoteJid;
    const msgText = message.body || message.message?.conversation || message.message?.extendedTextMessage?.text || "";

    if (!configmanager.config.users[myNumber]?.response) return;

    // Vérifie si le message contient une mention de ton numéro
    if (!message.key.fromMe && msgText.includes(`@${myNumber}`)) {
        const audioPath = "database/DigiX.mp3";
        
        if (fs.existsSync(audioPath)) {
            await monarque.sendMessage(chatId, {
                audio: { url: audioPath },
                mimetype: "audio/mp4", // Plus compatible pour WhatsApp
                ptt: true,
                contextInfo: { 
                    externalAdReply: { title: "Monarque MD Response", body: "Propulsé par MD227", mediaType: 1, renderLargerThumbnail: false }
                }
            }, { quoted: message });
        }
    }
}

// 4. HIDETAG : Mentionne tout le monde sans liste (sur texte ou média cité)
export async function tag(monarque, message) {
    const chatId = message.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return;

    try {
        const metadata = await monarque.groupMetadata(chatId);
        const participants = metadata.participants.map(user => user.id);
        
        const msgText = message.body || "";
        const args = msgText.split(' ').slice(1).join(' ') || 'Digital Crew Alert';

        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (quoted) {
            // Si on répond à un sticker, on le renvoie avec les mentions
            if (quoted.stickerMessage) {
                return await monarque.sendMessage(chatId, { sticker: quoted.stickerMessage, mentions: participants });
            }
            // Si on répond à du texte
            const quotedText = quoted.conversation || quoted.extendedTextMessage?.text || "Announcement";
            return await monarque.sendMessage(chatId, { text: quotedText, mentions: participants });
        }

        // Tag simple
        await monarque.sendMessage(chatId, { text: args, mentions: participants }, { quoted: message });

    } catch (error) {
        console.error("Tag error:", error);
    }
}

export default { tagall, tagadmin, respond, tag };
