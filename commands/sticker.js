import pkg from 'wa-sticker-formatter';
const { Sticker, StickerTypes } = pkg;
import { downloadMediaMessage } from "@whiskeysockets/baileys"; // ✅ Correction de l'import
import fs from "fs";
import path from "path";
import { exec } from "child_process";

export async function sticker(monarque, m) {
    const chatId = m.chat;
    let tempInput, tempOutput;

    try {
        // 1. Détection du message (direct ou cité)
        const quoted = m.quoted ? m.quoted : m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const msg = m.message?.imageMessage || m.message?.videoMessage || quoted?.imageMessage || quoted?.videoMessage;

        if (!msg) {
            return monarque.sendMessage(chatId, { text: "❌ *Usage:* Envoie ou réponds à une *image* ou *vidéo* avec .sticker" }, { quoted: m });
        }

        const username = m.pushName || "Monarque User";
        const isVideo = !!(msg.videoMessage || (quoted && quoted.videoMessage));

        // Réaction de chargement
        await monarque.sendMessage(chatId, { react: { text: "⏳", key: m.key } });

        // 2. Téléchargement du média
        // On passe l'objet correct pour le téléchargement
        const buffer = await downloadMediaMessage(
            m.quoted ? { message: quoted } : m,
            "buffer",
            {},
            { logger: console }
        );

        if (!buffer) throw new Error("Échec du téléchargement du média.");

        // 3. Gestion des fichiers temporaires
        const uniqueId = Date.now();
        tempInput = `./temp_${uniqueId}${isVideo ? '.mp4' : '.jpg'}`;
        fs.writeFileSync(tempInput, buffer);

        // 4. Création du sticker avec wa-sticker-formatter (Gère FFmpeg en interne si installé)
        const sticker = new Sticker(tempInput, {
            pack: `𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 227`, // Nom du pack
            author: username,      // Auteur (celui qui a fait la commande)
            type: StickerTypes.FULL,
            categories: ['🤩', '🚀'],
            id: '12345',
            quality: 60,
        });

        // 5. Envoi direct
        const stickerMessage = await sticker.toMessage();
        await monarque.sendMessage(chatId, stickerMessage, { quoted: m });

        // Réaction de succès
        await monarque.sendMessage(chatId, { react: { text: "✅", key: m.key } });

    } catch (error) {
        console.error("❌ Sticker Error:", error.message);
        await monarque.sendMessage(chatId, { text: `⚠️ Erreur : ${error.message}` }, { quoted: m });
    } finally {
        // Nettoyage sécurisé
        if (tempInput && fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
    }
}

export default sticker;
