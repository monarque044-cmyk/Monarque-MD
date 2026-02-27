import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { downloadMediaMessage } from "@whiskeysockets/baileys"; // ✅ Correction de l'import
import fs from "fs";
import path from "path";
import stylizedChar from '../utils/fancy.js';

export async function take(client, message) {
    const remoteJid = message.key.remoteJid;

    try {
        // 1. Récupération des arguments et du message cité
        const msgText = message.body || message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const args = msgText.split(' ').slice(1);
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        // Vérification : est-ce un sticker ?
        if (!quoted || !quoted.stickerMessage) {
            return client.sendMessage(remoteJid, { 
                text: stylizedChar("_❌ Réponds à un sticker pour modifier ses métadonnées (Pack/Auteur)_") 
            }, { quoted: message });
        }

        // Définition du Nom du Pack et de l'Auteur
        const packName = args.length > 0 ? args.join(" ") : (message.pushName || "Monarque MD");
        const authorName = "𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 227"; // Ta signature personnalisée

        await client.sendMessage(remoteJid, { react: { text: "📥", key: message.key } });

        // 2. Téléchargement du sticker original
        // Utilisation de la méthode correcte pour @whiskeysockets/baileys
        const buffer = await downloadMediaMessage(
            message.message.extendedTextMessage.contextInfo,
            'buffer',
            {},
            { logger: console }
        );

        if (!buffer) {
            return client.sendMessage(remoteJid, { text: "❌ Erreur lors du téléchargement du sticker." });
        }

        // 3. Création du nouveau sticker avec les nouvelles métadonnées
        const sticker = new Sticker(buffer, {
            pack: packName,
            author: authorName,
            type: StickerTypes.FULL,
            categories: ['🤩', '🚀'],
            id: '12345',
            quality: 70, // Qualité augmentée pour 2026
        });

        // 4. Envoi direct via la méthode intégrée de wa-sticker-formatter
        const stickerMessage = await sticker.toMessage();
        await client.sendMessage(remoteJid, stickerMessage, { quoted: message });

        // Réaction de succès
        await client.sendMessage(remoteJid, { react: { text: "✅", key: message.key } });

    } catch (error) {
        console.error("❌ Error Take Sticker:", error);
        await client.sendMessage(remoteJid, { text: `⚠️ Erreur : ${error.message}` });
    }
}

export default take;
