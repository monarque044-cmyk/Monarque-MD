import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import configs from "../utils/configmanager.js";
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
        tags: "🏷️", moderation: "🛡️", owner: "✨", creator: "👑",
        fun: "🎮", anime: "💮", rpg: "⚔️", settings: "🔧"
    };
    return icons[category.trim().toLowerCase()] || "🎯";
}

export default async function info(client, message) {
    try {
        const remoteJid = message.key.remoteJid;
        const userName = message.pushName || "Utilisateur";

        // --- Système & RAM ---
        const usedRam = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
        const totalRam = (os.totalmem() / 1024 / 1024).toFixed(1);
        const uptime = formatUptime(process.uptime());

        // --- Config Bot ---
        const botNumber = client.user.id.split(":")[0];
        const prefix = configs.config.users?.[botNumber]?.prefix || ".";

        // --- Date & Heure ---
        const now = new Date();
        const day = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"][now.getDay()];
        const date = now.toLocaleDateString('fr-FR');

        // --- Extraction des commandes ---
        // ⚠️ Vérifie bien que le chemin vers messageHandler.js est exact
        const handlerPath = path.join(__dirname, "../events/messageHandler.js");
        let categories = {};
        
        try {
            if (fs.existsSync(handlerPath)) {
                const handlerCode = fs.readFileSync(handlerPath, "utf-8");
                const commandRegex = /case\s+['"](\w+)['"]\s*:\s*\/\/\s*@cat:\s*([^\n\r]+)/g;
                let match;
                while ((match = commandRegex.exec(handlerCode)) !== null) {
                    const [_, command, category] = match;
                    const catName = category.trim();
                    if (!categories[catName]) categories[catName] = [];
                    categories[catName].push(command);
                }
            }
        } catch (e) {
            console.error("❌ Erreur lecture messageHandler:", e.message);
        }

        // --- Construction du Menu ---
        let menu = `┏━━━〔 ${stylizedChar("Monarque MD", "bold")} 〕━━━┓\n`;
        menu += `┃ 🔱 ${stylizedChar("Version", "bold")} : 1.0.0\n`;
        menu += `┃ 👤 ${stylizedChar("User", "bold")} : ${userName}\n`;
        menu += `┃ ⏱️ ${stylizedChar("Uptime", "bold")} : ${uptime}\n`;
        menu += `┃ 🚀 ${stylizedChar("RAM", "bold")} : ${usedRam}MB / ${totalRam}MB\n`;
        menu += `┃ 📅 ${stylizedChar("Date", "bold")} : ${date}\n`;
        menu += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;

        // Tri des catégories par nom
        const sortedCategories = Object.keys(categories).sort();

        for (const category of sortedCategories) {
            const icon = getCategoryIcon(category);
            menu += `┏━━━ ${icon} *${category.toUpperCase()}*\n`;
            categories[category].forEach(cmd => {
                menu += `┃ › ${prefix}${cmd}\n`;
            });
            menu += `┗━━━━━━━━━━━━━━━\n\n`;
        }

        menu += `> ${stylizedChar("Always Dare to dream big", "script")}\n`;
        menu += `*𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝟚𝟚𝟟*`;

        // --- Envoi sécurisé ---
        const imagePath = "./database/menu.jpg"; // Vérifie que ce fichier existe !

        const sendOptions = {
            caption: menu,
            contextInfo: {
                externalAdReply: {
                    title: "𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝕊𝕪𝕤𝕥𝕖𝕞",
                    body: "Connecté avec succès",
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    thumbnailUrl: "https://telegra.ph", // Image de secours
                    sourceUrl: "https://github.com"
                }
            }
        };

        if (fs.existsSync(imagePath)) {
            await client.sendMessage(remoteJid, { image: { url: imagePath }, ...sendOptions }, { quoted: message });
        } else {
            await client.sendMessage(remoteJid, { text: menu }, { quoted: message });
        }

    } catch (err) {
        console.error("❌ Crash dans menu.js:", err);
        // Envoi d'un message d'erreur simple pour éviter que l'utilisateur ne reste sans réponse
        const remoteJid = message.key.remoteJid;
        await client.sendMessage(remoteJid, { text: "⚠️ Erreur lors de l'affichage du menu." });
    }
                        }
