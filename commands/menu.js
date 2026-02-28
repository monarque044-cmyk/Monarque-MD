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

export default async function info(client, message) {
    try {
        const remoteJid = message.key.remoteJid;
        const userName = message.pushName || "Utilisateur";

        const usedRam = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
        const totalRam = (os.totalmem() / 1024 / 1024).toFixed(1);
        const uptime = formatUptime(process.uptime());

        const botNumber = client.user.id.split(':');
        const prefix = configs.config.users?.[botNumber]?.prefix || ".";
        const date = new Date().toLocaleDateString('fr-FR');

        // --- DÉFINITION DES CATÉGORIES ---
        const categoriesMap = {
            "🛠️ SYSTÈME": ["uptime", "ping", "menu", "help", "statut", "setprefix", "public", "fancy"],
            "🎵 MUSIQUE": ["spotify", "sp", "music", "song", "play"],
            "📸 MÉDIA": ["tiktok", "tt", "img", "sticker", "s", "viewonce", "transcribe"],
            "🎮 JEUX & FUN": ["quiz", "trivia", "rpg", "profile", "me", "compliment", "goodnight", "weather"],
            "💮 ANIME": ["waifu", "animenew", "newsanime", "nsfw", "hentai"],
            "🛡️ MODÉRATION": ["antidemote", "sudo", "delsudo", "take", "setpp", "getpp"]
        };

        // --- EXTRACTION DYNAMIQUE ---
        const handlerPath = path.join(__dirname, "../events/messageHandler.js");
        let allExtracted = [];
        
        try {
            if (fs.existsSync(handlerPath)) {
                const handlerCode = fs.readFileSync(handlerPath, "utf-8");
                const commandRegex = /'(\w+)'\s*:/g;
                let match;
                while ((match = commandRegex.exec(handlerCode)) !== null) {
                    if (!allExtracted.includes(match[1])) allExtracted.push(match[1]);
                }
            }
        } catch (e) { console.error("Erreur extraction:", e); }

        // --- CONSTRUCTION DU MENU ---
        let menu = `┏━━━〔 ${stylizedChar("Monarque MD", "bold")} 〕━━━┓\n`;
        menu += `┃ 🔱 *Version* : 1.0.0\n`;
        menu += `┃ 👤 *User* : ${userName}\n`;
        menu += `┃ ⏱️ *Uptime* : ${uptime}\n`;
        menu += `┃ 🚀 *RAM* : ${usedRam}MB / ${totalRam}MB\n`;
        menu += `┃ 📅 *Date* : ${date}\n`;
        menu += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;

        // Tri et affichage par catégories
        for (const [catName, commandsList] of Object.entries(categoriesMap)) {
            // On ne garde que les commandes qui existent réellement dans ton handler
            const available = allExtracted.filter(c => commandsList.includes(c));
            
            if (available.length > 0) {
                menu += `┏━━━ ${catName}\n`;
                available.sort().forEach(cmd => {
                    menu += `┃ › ${prefix}${cmd}\n`;
                });
                menu += `┗━━━━━━━━━━━━━━━\n\n`;
            }
        }

        // Gestion des commandes "Orphelines" (qui ne sont dans aucune catégorie définie)
        const classified = Object.values(categoriesMap).flat();
        const others = allExtracted.filter(c => !classified.includes(c));

        if (others.length > 0) {
            menu += `┏━━━ 🎯 AUTRES\n`;
            others.sort().forEach(cmd => menu += `┃ › ${prefix}${cmd}\n`);
            menu += `┗━━━━━━━━━━━━━━━\n\n`;
        }

        menu += `> ${stylizedChar("Always Dare to dream big", "script")}\n`;
        menu += `*𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝟚𝟚𝟟*`;

        // --- ENVOI ---
        const imagePath = "./database/menu.jpg"; 
        const sendOptions = {
            caption: menu,
            contextInfo: {
                externalAdReply: {
                    title: "𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝕊𝕪𝕤𝕥𝕖𝕞",
                    body: "Menu Catégorisé",
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    thumbnailUrl: "https://telegra.ph", 
                    sourceUrl: "" // ✅ Suppression lien GitHub
                }
            }
        };

        if (fs.existsSync(imagePath)) {
            await client.sendMessage(remoteJid, { image: fs.readFileSync(imagePath), ...sendOptions }, { quoted: message });
        } else {
            await client.sendMessage(remoteJid, { text: menu, contextInfo: sendOptions.contextInfo }, { quoted: message });
        }

    } catch (err) { console.error("Erreur menu:", err); }
                                         }
                                  
