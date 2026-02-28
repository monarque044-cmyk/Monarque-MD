import axios from 'axios';
import fs from 'fs';

const dbPath = './database.json';
const CATEGORIES = ['waifu', 'neko', 'shinobu', 'megumin'];

// ✅ On exporte directement la fonction pour le messageHandler
const image = async (monarque, m, args) => {
    try {
        const chatId = m.key.remoteJid;
        const userId = m.key.participant || m.key.remoteJid;

        // Initialisation sécurisée de la DB
        if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({ groups: {} }));
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

        const action = args[0]?.toLowerCase();

        // --- GESTION ACTIVATION / DÉSACTIVATION ---
        if (action === 'on' || action === 'off') {
            const isGroup = chatId.endsWith('@g.us');
            let isAdmin = !isGroup; // Toujours admin en PV

            if (isGroup) {
                const groupMetadata = await monarque.groupMetadata(chatId);
                isAdmin = groupMetadata.participants.find(p => p.id === userId)?.admin !== null;
            }

            if (!isAdmin) {
                return monarque.sendMessage(chatId, { text: '🚫 Seuls les administrateurs peuvent configurer cela.' }, { quoted: m });
            }

            if (!db.groups) db.groups = {};
            db.groups[chatId] = { active: (action === 'on') };
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            return monarque.sendMessage(chatId, { 
                text: `✅ Commande d'images ${action === 'on' ? 'ACTIVÉE' : 'DÉSACTIVÉE'} pour ce chat.` 
            }, { quoted: m });
        }

        // --- VÉRIFICATION SI ACTIVÉ ---
        const isEnabled = db.groups?.[chatId]?.active !== false; // Activé par défaut si pas de config

        if (!isEnabled) {
            return monarque.sendMessage(chatId, { 
                text: '⚠️ *Cette commande est désactivée ici.*\nUn administrateur peut taper `.img on` pour l\'activer.' 
            }, { quoted: m });
        }

        // --- ENVOI DE L'IMAGE ---
        await monarque.sendMessage(chatId, { react: { text: "📷", key: m.key } });

        const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        
        // ✅ URL CORRIGÉE (Ajout de /sfw/ ou /nsfw/ selon ton choix)
        const res = await axios.get(`https://api.waifu.pics{category}`);
        
        if (!res.data?.url) throw new Error('Erreur de réponse');

        await monarque.sendMessage(chatId, {
            image: { url: res.data.url },
            caption: `✨ *𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 𝕀𝕞𝕒𝕘𝕖* (${category.toUpperCase()})\n\n_Tapez .img off pour désactiver._`
        }, { quoted: m });

    } catch (err) {
        console.error('❌ Erreur Image:', err.message);
        const chatId = m.key.remoteJid;
        await monarque.sendMessage(chatId, { text: '❌ Service temporairement indisponible.' }, { quoted: m });
    }
};

export default image;
        
