import axios from 'axios';
import fs from 'fs';

const dbPath = './database.json';
const CATEGORIES = ['waifu', 'neko', 'shinobu', 'megumin']; // Catégories SFW (Safe For Work)

export default {
    name: 'image',
    alias: ['img', 'pic'],
    category: 'Fun',
    description: 'Affiche une image aléatoire (Gestion par admin)',

    async execute(monarque, m, args) {
        const chatId = m.chat;

        if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({ groups: {} }));
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

        const action = args[0]?.toLowerCase();
        if (action === 'on' || action === 'off') {
            const groupMetadata = m.isGroup ? await monarque.groupMetadata(chatId) : null;
            const isAdmin = groupMetadata?.participants.find(p => p.id === m.sender)?.admin;

            if (m.isGroup && !isAdmin) {
                return monarque.sendMessage(chatId, { text: '🚫 Seuls les administrateurs peuvent configurer cette commande.' }, { quoted: m });
            }

            if (!db.groups) db.groups = {};
            db.groups[chatId] = { active: (action === 'on') };
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            return monarque.sendMessage(chatId, { 
                text: `✅ Commande d'images ${action === 'on' ? 'ACTIVÉE' : 'DÉSACTIVÉE'}.` 
            }, { quoted: m });
        }

        const isEnabled = db.groups?.[chatId]?.active || !m.isGroup;

        if (!isEnabled) {
            return monarque.sendMessage(chatId, { 
                text: '⚠️ *Cette commande est désactivée ici.*\nUn administrateur peut taper `.image on` pour l\'activer.' 
            }, { quoted: m });
        }

        try {
            await monarque.sendMessage(chatId, { react: { text: "📷", key: m.key } });

            const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
            const res = await axios.get(`https://api.waifu.pics{category}`);
            
            if (!res.data?.url) throw new Error('Erreur de réponse');

            await monarque.sendMessage(chatId, {
                image: { url: res.data.url },
                caption: `✨ *Image (${category})*\n\n_Utilisez .image off pour désactiver._`
            }, { quoted: m });

        } catch (err) {
            console.error('Erreur:', err.message);
            await monarque.sendMessage(chatId, { text: '❌ Impossible de récupérer l\'image pour le moment.' }, { quoted: m });
        }
    }
};
                                        
