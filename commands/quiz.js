import axios from "axios";
import he from "he";
import fs from "fs";

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
        // CORRECTION : Ajout de l'URL Google Translate complète
        const res = await axios.get(`https://translate.googleapis.com{encodeURIComponent(text)}`);
        return res.data[0][0][0] || text;
    } catch { return text; }
}

export default {
    name: "quiz",
    alias: ["trivia", "topquiz"],
    category: "Fun",

    async execute(monarque, m, args) {
        const chatId = m.chat;
        const input = args.join(" ").trim();

        // ================== CLASSEMENT (TOP) ==================
        if (input === "top") {
            const data = getScores();
            const top = Object.entries(data)
                .sort((a, b) => (b[1].level || 0) - (a[1].level || 0)) // Tri par niveau
                .slice(0, 10);

            if (top.length === 0) return monarque.sendMessage(chatId, { text: "🏆 Aucun score enregistré." });

            let txt = "🏆 *HALL OF FAME - QUIZ MONARQUE* 🏆\n\n";
            top.forEach((user, i) => {
                const jid = user[0];
                const stats = user[1];
                let reward = (i === 0) ? " ✨ [ 👑 L'ÉRUDIT SUPRÊME ] ✨" : "";
                let emoji = (i === 0) ? "🥇" : (i === 1) ? "🥈" : (i === 2) ? "🥉" : `${i + 1}.`;

                txt += `${emoji} @${jid.split("@")[0]}${reward}\n└─ Niveau : *${stats.level || 1}* | XP : *${stats.xp || 0}*\n\n`;
            });

            return monarque.sendMessage(chatId, { text: txt, mentions: top.map(u => u[0]) });
        }

        // ================== RÉPONSE À UNE QUESTION ==================
        if (input.length > 0) {
            if (!triviaGames[chatId]) return monarque.sendMessage(chatId, { text: "❌ Pas de quiz en cours. Tape `.quiz`" });

            const game = triviaGames[chatId];
            const index = parseInt(input, 10);
            let isCorrect = false;

            if (!isNaN(index) && index >= 1 && index <= game.options.length) {
                if (normalizeText(game.options[index - 1]) === normalizeText(game.correctAnswer)) isCorrect = true;
            } else if (normalizeText(input) === normalizeText(game.correctAnswer)) {
                isCorrect = true;
            }

            if (isCorrect) {
                const userId = m.sender;
                let data = getScores();

                if (!data[userId]) data[userId] = { xp: 0, level: 1, prestige: 0, coins: 0 };

                const xpGagne = 50; 
                const coinsGagnes = 25;
                data[userId].xp += xpGagne;
                data[userId].coins += coinsGagnes;

                const xpNecessaire = data[userId].level * 150; 
                let levelUpMsg = "";

                if (data[userId].xp >= xpNecessaire) {
                    data[userId].level += 1;
                    data[userId].xp = 0;
                    levelUpMsg = `\n\n🎊 *LEVEL UP !* 🎊\n✨ Tu es maintenant niveau *${data[userId].level}* !`;
                }

                fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

                const victoireTxt = `🎉 *BIEN JOUÉ @${userId.split('@')[0]} !*\n\n` +
                                   `✅ La réponse était : *${game.correctAnswer}*\n` +
                                   `💰 +${coinsGagnes} pièces\n` +
                                   `🌟 +${xpGagne} XP${levelUpMsg}`;

                await monarque.sendMessage(chatId, { text: victoireTxt, mentions: [userId] }, { quoted: m });
                delete triviaGames[chatId];
                return;
            } else {
                return monarque.sendMessage(chatId, { text: "❌ Mauvaise réponse ! Réessaie ou attends le prochain quiz." });
            }
        }

        // ================== NOUVELLE QUESTION ==================
        if (triviaGames[chatId]) return monarque.sendMessage(chatId, { text: "⚠️ Un quiz est déjà lancé !" });

        try {
            await monarque.sendMessage(chatId, { text: "🔍 _Génération d'un quiz..._" });
            // CORRECTION : Ajout du endpoint API complet
            const response = await axios.get("https://opentdb.com");
            const qData = response.data.results[0];

            const questionFr = await translateToFrench(he.decode(qData.question));
            const correctFr = await translateToFrench(he.decode(qData.correct_answer));
            const incorrectsFr = await Promise.all(qData.incorrect_answers.map(async ans => await translateToFrench(he.decode(ans))));
            
            const options = [...incorrectsFr, correctFr].sort(() => Math.random() - 0.5);
            triviaGames[chatId] = { correctAnswer: correctFr, options };

            const optionsText = options.map((opt, i) => `*${i + 1}️)* ${opt}`).join("\n");
            await monarque.sendMessage(chatId, { 
                text: `🧠 *QUIZ MONARQUE*\n\n*Question :* ${questionFr}\n\n${optionsText}\n\n👉 Réponds : \`.quiz <numéro>\`\n🏆 Voir le top : \`.quiz top\`` 
            });
        } catch (err) {
            console.error(err);
            await monarque.sendMessage(chatId, { text: "❌ Erreur de génération. Réessaie." });
        }
    }
};
    
