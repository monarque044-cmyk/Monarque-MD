import fs from 'fs';
import path from 'path';

// Chemins et Initialisation
const antiDemoteFile = path.join(process.cwd(), 'system/antidemote.json');
if (!fs.existsSync(path.join(process.cwd(), 'system'))) {
    fs.mkdirSync(path.join(process.cwd(), 'system'), { recursive: true });
}

let antiDemoteData = {};
try {
    if (fs.existsSync(antiDemoteFile)) {
        antiDemoteData = JSON.parse(fs.readFileSync(antiDemoteFile, 'utf-8'));
    }
} catch (e) {
    antiDemoteData = {};
}

function saveAntiDemote() {
    fs.writeFileSync(antiDemoteFile, JSON.stringify(antiDemoteData, null, 2));
}

const processing = new Set();

export default {
    name: 'antidemote',
    description: '🛡️ Empêche la destitution automatique des admins',
    category: 'Groupe',
    
    // La fonction de commande (appelée via ton switch case)
    async execute(monarque, m, args) {
        const chatId = m.chat;
        if (!m.isGroup) return monarque.sendMessage(chatId, { text: '❌ Cette commande ne fonctionne que dans les groupes.' }, { quoted: m });

        const action = args[0]?.toLowerCase();

        if (action === 'on') {
            const metadata = await monarque.groupMetadata(chatId);
            antiDemoteData[chatId] = {
                enabled: true,
                protectedAdmins: metadata.participants
                    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                    .map(p => p.id)
            };
            saveAntiDemote();
            return monarque.sendMessage(chatId, { text: '✅ *Anti-Demote ACTIVÉ*.\nLes admins actuels sont désormais protégés.' }, { quoted: m });
        }

        if (action === 'off') {
            delete antiDemoteData[chatId];
            saveAntiDemote();
            return monarque.sendMessage(chatId, { text: '❌ *Anti-Demote DÉSACTIVÉ*.' }, { quoted: m });
        }

        if (action === 'status') {
            const isActive = antiDemoteData[chatId]?.enabled || false;
            return monarque.sendMessage(chatId, { 
                text: isActive ? `✅ *Anti-Demote* est actuellement **ACTIF**.` : '❌ *Anti-Demote* est actuellement **INACTIF**.' 
            }, { quoted: m });
        }

        // Aide si l'argument est invalide
        return monarque.sendMessage(chatId, { 
            text: `*COMMANDE ANTIDEMOTE*\n\nUsage :\n.antidemote on\n.antidemote off\n.antidemote status`
        }, { quoted: m });
    },

    // ⚠️ CETTE FONCTION DOIT ÊTRE APPELÉE DANS TON INDEX.JS
    async onUpdate(monarque, update) {
        const { id, participants, action } = update;
        
        if (!antiDemoteData[id]?.enabled) return;
        if (action !== 'demote') return;

        const botId = monarque.user.id.split(':')[0] + '@s.whatsapp.net';

        for (const user of participants) {
            if (user === botId) continue;
            
            const key = `${id}-${user}-demote`;
            if (processing.has(key)) continue;
            processing.add(key);

            setTimeout(async () => {
                try {
                    // On vérifie si l'utilisateur était dans notre liste de protection
                    if (antiDemoteData[id].protectedAdmins.includes(user)) {
                        await monarque.groupParticipantsUpdate(id, [user], 'promote');
                        await monarque.sendMessage(id, {
                            text: `🛡️ *Sécurité Anti-Demote*\n@${user.split('@')[0]} a été rétabli administrateur.`,
                            mentions: [user]
                        });
                    }
                } catch (err) {
                    console.error('Erreur Anti-Demote:', err);
                } finally {
                    processing.delete(key);
                }
            }, 1000);
        }
    }
};
            
