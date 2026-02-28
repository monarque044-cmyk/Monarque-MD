import axios from "axios";
import he from "he";
import fs from "fs";

// ✅ Export nommé correct pour les modules ESM
export const triviaGames = {}; 
const dbPath = "./database.json";

// Initialisation de la DB
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

function getScores() {
    try {
        return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    } catch { return {}; }
}

function normalizeText(str) {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

async function translateToFrench(text) {
    try {
        // ✅ URL Google Translate Fixée
        const res = await axios.get(`https://translate.googleapis.com{encodeURIComponent(text)}`);
        return res.data[0][0][0] || text;
    } catch { return text; }
}

const quiz = async (monarque, m, args) => {
    try {
        const chatId = m.key.remoteJid;
        const userId = m.key.participant || m.key.remoteJid;
        const input = args.join(" ").trim().toLowerCase();

        // ================== CLASSEMENT (TOP) ==================
        if (input === "top") {
            const data = getScores();
            const top = Object.entries(data)
                .sort((a, b) => (b[1].level || 0) - (a[1].level || 0))
                .slice(0, 10);

            if (top.length === 0) return monarque.sendMessage(chatId, { text: "🏆 Aucun score enregistré." });

            let txt = "🏆 *HALL OF FAME - QUIZ MONARQUE* 🏆\n\n";
            top.forEach((user, i) => {
                const jid = user[0];
                const stats = user[1];
                let emoji = (i === 0) ? "🥇" : (i === 1) ? "🥈" : (i === 2) ? "🥉" : `${i + 1}.`;
                let badge = stats.prestige > 0 ? ` [ 🎖️ P.${stats.prestige} ]` : "";
                txt += `${emoji} @${jid.split("@")[0]}${badge}\n└─ Niveau : *${stats.level || 1}* | XP : *${stats.xp || 0}*\n\n`;
            });

            return monarque.sendMessage(chatId, { text: txt, mentions: top.map(u => u[0]) });
        }

        // ================== COMMANDE PRESTIGE ==================
        if (input === "prestige") {
            let data = getScores();
            const stats = data[userId];

            if (!stats || stats.level < 100) {
                return monarque.sendMessage(chatId, { text: "❌ Tu dois être niveau *100* pour passer un prestige !" });
            }

            stats.prestige = (stats.prestige || 0) + 1;
            stats.level = 1;
            stats.xp = 0;
            stats.coins = (stats.coins || 0) + 1000;

            fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
            return monarque.sendMessage(chatId, { 
                text: `✨ *ASCENSION DE PRESTIGE* ✨\n\n@${userId.split('@')[0]} est désormais Rang *${stats.prestige}* !\n📈 Gains XP boostés de ${stats.prestige * 10}% !`, 
                mentions: [userId] 
            });
        }

        // ================== RÉPONSE À UNE QUESTION ==================
        if (input.length > 0 && triviaGames[chatId]) {
            const game = triviaGames[chatId];
            const index = parseInt(input, 10);
            let isCorrect = false;

            if (!isNaN(index) && index >= 1 && index <= game.options.length) {
                if (normalizeText(game.options[index - 1]) === normalizeText(game.correctAnswer)) isCorrect = true;
            } else if (normalizeText(input) === normalizeText(game.correctAnswer)) {
                isCorrect = true;
            }

            if (isCorrect) {
                let data = getScores();
                if (!data[userId]) data[userId] = { xp: 0, level: 1, prestige: 0, coins: 0 };

                const bonus = 1 + ((data[userId].prestige || 0) * 0.1);
                const xpGagne = Math.round(50 * bonus);
                const coinsGagnes = Math.round(25 * bonus);

                data[userId].xp += xpGagne;
                data[userId].coins = (data[userId].coins || 0) + coinsGagnes;

                let msgFin = `🎉 *BIEN JOUÉ @${userId.split('@')[0]} !*\n✅ Réponse : *${game.correctAnswer}*\n💰 +${coinsGagnes} pièces | 🌟 +${xpGagne} XP`;

                const xpNeeded = data[userId].level * 150;
                if (data[userId].xp >= xpNeeded) {
                    data[userId].level += 1;
                    data[userId].xp = 0;
                    msgFin += `\n\n🎊 *LEVEL UP !* Niveau *${data[userId].level}* !`;
                    if (data[userId].level >= 100) msgFin += `\n👉 Tape *.quiz prestige* !`;
                }

                fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
                await monarque.sendMessage(chatId, { text: msgFin, mentions: [userId] }, { quoted: m });
                delete triviaGames[chatId];
                return;
            } else {
                return monarque.sendMessage(chatId, { text: "❌ Mauvaise réponse ! Réessaie." });
            }
        }

        // ================== NOUVELLE QUESTION ==================
        if (triviaGames[chatId]) return monarque.sendMessage(chatId, { text: "⚠️ Un quiz est déjà lancé !" });

        await monarque.sendMessage(chatId, { text: "🔍 _Génération d'un quiz..._" });
        
        // ✅ URL API OpenTDB Fixée
        const response = await axios.get("https://opentdb.com");
        const qData = response.data.results[0];

        const questionFr = await translateToFrench(he.decode(qData.question));
        const correctFr = await translateToFrench(he.decode(qData.correct_answer));
        const incorrectsFr = await Promise.all(qData.incorrect_answers.map(async ans => await translateToFrench(he.decode(ans))));
        
        const options = [...incorrectsFr, correctFr].sort(() => Math.random() - 0.5);
        triviaGames[chatId] = { correctAnswer: correctFr, options };

        const optionsText = options.map((opt, i) => `*${i + 1}️)* ${opt}`).join("\n");
        await monarque.sendMessage(chatId, { 
            text: `🧠 *QUIZ MONARQUE*\n\n*Question :* ${questionFr}\n\n${optionsText}\n\n👉 Réponds le numéro !\n🏆 Top : \`.quiz top\`` 
        });

    } catch (err) {
        console.error("Erreur Quiz:", err);
        const chatId = m.key.remoteJid;
        await monarque.sendMessage(chatId, { text: "❌ Erreur de génération. Réessaie." });
    }
};

// ✅ Liaison pour messageHandler
quiz.execute = quiz; 

export default quiz;
                    
