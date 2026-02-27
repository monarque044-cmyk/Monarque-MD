import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import configs from "../utils/configmanager.js";
import { getDevice } from "@whiskeysockets/baileys"; // ✅ Correction de l'import
import stylizedChar from "../utils/fancy.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function formatUptime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
}

function getCategoryIcon(category) {
    const icons = {
        utils: "⚙️", media: "📸", group: "👥", bug: "🐞",
        tags: "🏷️", moderation: "😶‍🌫️", owner: "✨", creator: "👑",
        fun: "🎮", anime: "💮", rpg: "⚔️"
    };
    return icons[category.toLowerCase()] || "🎯";
}

export default async function info(client, message) {
    try {
        const remoteJid = message.key.remoteJid;
        const userName = message.pushName || "User";

        // --- Système & RAM ---
        const usedRam = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
        const totalRam = (os.totalmem() / 1024 / 1024).toFixed(1);
        const uptime = formatUptime(process.uptime());

        // --- Config Bot ---
        const botId = client.user.id.split(":")[0];
        const prefix = configs.config.users?.[botId]?.prefix || ".";

        // --- Date & Heure ---
        const now = new Date();
        const day = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"][now.getDay()];
        const date = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

        // --- Extraction des commandes via Regex ---
        const handlerPath = path.join(__dirname, "../events/messageHandler.js");
        let categories = {};
        
        try {
            const handlerCode = fs.readFileSync(handlerPath, "utf-8");
            const commandRegex = /case\s+['"](\w+)['"]\s*:\s*\/\/\s*@cat:\s*([^\n\r]+)/g;
            let match;
            while ((match = commandRegex.exec(handlerCode)) !== null) {
                const [_, command, category] = match;
                if (!categories[category]) categories[category] = [];
                categories[category].push(command);
            }
        } catch (e) {
            console.error("Impossible de lire le messageHandler:", e.message);
        }

        // --- Construction du Menu Stylisé ---
        let menu = `┏━━━〔 ${stylizedChar("Monarque MD", "script")} 〕━━━┓\n`;
        menu += `┃ 🔱 ${stylizedChar("Version", "bold")} : 1.0.0\n`;
        menu += `┃ 👤 ${stylizedChar("User", "bold")} : ${userName}\n`;
        menu += `┃ ⏱️ ${stylizedChar("Uptime", "bold")} : ${uptime}\n`;
        menu += `┃ 🚀 ${stylizedChar("RAM", "bold")} : ${usedRam}/${totalRam} MB\n`;
        menu += `┃ 📅 ${stylizedChar("Date", "bold")} : ${date} (${day})\n`;
        menu += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;

        for (const [category, commands] of Object.entries(categories)) {
            const icon = getCategoryIcon(category);
            menu += `┏━━━ ${icon} *${category.toUpperCase()}*\n`;
            commands.forEach(cmd => {
                menu += `┃ › ${prefix}${stylizedChar(cmd, "bold")}\n`;
            });
            menu += `┗━━━━━━━━━━━━━━━\n\n`;
        }

        menu += `> ${stylizedChar("Always Dare to dream big", "script")}`;

        // --- Envoi avec Image de Fond ---
        const imagePath = "./database/menu.jpg";
        const device = getDevice(message.key.id);

        if (fs.existsSync(imagePath)) {
            await client.sendMessage(remoteJid, {
                image: { url: imagePath },
                caption: menu,
                contextInfo: {
                    externalAdReply: {
                        title: "𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝟚𝟚𝟟 𝕊𝕪𝕤𝕥𝕖𝕞",
                        body: "Connected Successfully",
                        mediaType: 1,
                        renderLargerThumbnail: true,
                        thumbnailUrl: "https://telegra.ph", // Optionnel
                        sourceUrl: "https://chat.whatsapp.com"
                    }
                }
            }, { quoted: message });
        } else {
            await client.sendMessage(remoteJid, { text: menu }, { quoted: message });
        }

        await client.sendMessage(remoteJid, { react: { text: "🔱", key: message.key } });

    } catch (err) {
        console.error("Menu Error:", err);
    }
                                    }
