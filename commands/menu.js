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

        const usedRam = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
        const totalRam = (os.totalmem() / 1024 / 1024).toFixed(1);
        const uptime = formatUptime(process.uptime());

        const botNumber = client.user.id.split(":")[0];
        const prefix = configs.config.users?.[botNumber]?.prefix || ".";

        const now = new Date();
        const date = now.toLocaleDateString('fr-FR');

        // --- Extraction des commandes optimisée ---
        const handlerPath = path.join(__dirname, "../events/messageHandler.js");
        let categories = {};
        
        try {
            if (fs.existsSync(handlerPath)) {
                const handlerCode = fs.readFileSync(handlerPath, "utf-8");
                // Regex plus souple : capture la commande et la catégorie si elle existe
                const commandRegex = /case\s+['"](\w+)['"]\s*:(?:\s*\/\/\s*@cat:\s*([^\n\r]+))?/g;
                let match;
                while ((match = commandRegex.exec(handlerCode)) !== null) {
                    const cmd = match[1];
                    const catName = match[2] ? match[2].trim() : "AUTRES"; // Si pas de @cat, mis dans AUTRES
                    if (!categories[catName]) categories[catName] = [];
                    if (!categories[catName].includes(cmd)) categories[catName].push(cmd);
                }
            }
        } catch (e) {
            console.error("❌ Erreur lecture messageHandler:", e.message);
        }

        // --- Construction du Menu (Design préservé) ---
        let menu = `┏━━━〔 ${stylizedChar("Monarque MD", "bold")} 〕━━━┓\n`;
        menu += `┃ 🔱 ${stylizedChar("Version", "bold")} : 1.0.0\n`;
        menu += `┃ 👤 ${stylizedChar("User", "bold")} : ${userName}\n`;
        menu += `┃ ⏱️ ${stylizedChar("Uptime", "bold")} : ${uptime}\n`;
        menu += `┃ 🚀 ${stylizedChar("RAM", "bold")} : ${usedRam}MB / ${totalRam}MB\n`;
        menu += `┃ 📅 ${stylizedChar("Date", "bold")} : ${date}\n`;
        menu += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;

        const sortedCategories = Object.keys(categories).sort();

        for (const category of sortedCategories) {
            const icon = getCategoryIcon(category);
            menu += `┏━━━ ${icon} *${category.toUpperCase()}*\n`;
            // Tri des commandes par ordre alphabétique
            categories[category].sort().forEach(cmd => {
                menu += `┃ › ${prefix}${cmd}\n`;
            });
            menu += `┗━━━━━━━━━━━━━━━\n\n`;
        }

        menu += `> ${stylizedChar("Always Dare to dream big", "script")}\n`;
        menu += `*𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝟚𝟚𝟟*`;

        // --- Envoi avec l'image d'origine sans modification ---
        const imagePath = "./database/menu.jpg"; 

        const sendOptions = {
            caption: menu,
            contextInfo: {
                externalAdReply: {
                    title: "𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝕊𝕪𝕤𝕥𝕖𝕞",
                    body: "Connecté avec succès",
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    thumbnailUrl: "https://telegra.ph", 
                    sourceUrl: ""
                }
            }
        };

        // Utilisation de fs.readFileSync pour l'image locale pour assurer la compatibilité
        if (fs.existsSync(imagePath)) {
            await client.sendMessage(remoteJid, { image: fs.readFileSync(imagePath), ...sendOptions }, { quoted: message });
        } else {
            await client.sendMessage(remoteJid, { text: menu }, { quoted: message });
        }

    } catch (err) {
        console.error("❌ Crash dans menu.js:", err);
        const remoteJid = message.key.remoteJid;
        await client.sendMessage(remoteJid, { text: "⚠️ Erreur lors de l'affichage du menu." });
    }
}
