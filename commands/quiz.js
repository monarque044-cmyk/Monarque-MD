import axios from "axios";
import he from "he";
import fs from "fs";

const triviaGames = {}; 
const dbPath = "./database.json";

// Vérification de l'existence de la base de données
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

function getScores() {
    return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
}

function saveScore(userId) {
    const scores = getScores();
    scores[userId] = (scores[userId] || 0) + 1;
    fs.writeFileSync(dbPath, JSON.stringify(scores, null, 2));
}

function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

function normalizeText(str) {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

async function translateToFrench(text) {
    try {
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

        // ================== CLASSEMENT (TOP) AVEC RÉCOMPENSE ==================
        if (input === "top") {
            const scores = getScores();
            const top = Object.entries(scores)
                .sort((a, b) => b[1] - a[1]) // Tri par points
                .slice(0, 10);

            if (top.length === 0) return monarque.sendMessage(chatId, { text: "🏆 Aucun score enregistré pour le moment." });

            let txt = "🏆 *HALL OF FAME - QUIZ MONARQUE* 🏆\n\n";
            
            top.forEach((user, i) => {
                const jid = user[0];
                const points = user[1];
                let reward = "";

                // 🥇 Récompense spéciale pour le 1er
                if (i === 0) {
                    reward = " ✨ [ 👑 L'ÉRUDIT SUPRÊME ] ✨";
                    txt += `🥇 @${jid.split("@")[0]}${reward}\n└─ Score : *${points}* pts\n\n`;
                } else if (i === 1) {
                    txt += `🥈 @${jid.split("@")[0]}\n└─ Score : *${points}* pts\n`;
                } else if (i === 2) {
                    txt += `🥉 @${jid.split("@")[0]}\n└─ Score : *${points}* pts\n`;
                } else {
                    txt += `${i + 1}. @${jid.split("@")[0]} — *${points}* pts\n`;
                }
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
                saveScore(m.sender);
                const currentScore = getScores()[m.sender];
                await monarque.sendMessage(chatId, { 
                    text: `🎉 *Bravo @${m.sender.split("@")[0]} !*\n\n+1 point (Total: ${currentScore} pts)\nLa réponse était : *${game.correctAnswer}*`, 
                    mentions: [m.sender] 
                }, { quoted: m });
            } else {
                await monarque.sendMessage(chatId, { text: `❌ Raté ! La bonne réponse était : *${game.correctAnswer}*` });
            }
            delete triviaGames[chatId];
            return;
        }

        // ================== NOUVELLE QUESTION ==================
        if (triviaGames[chatId]) return monarque.sendMessage(chatId, { text: "⚠️ Un quiz est déjà lancé ! Réponds d'abord." });

        try {
            await monarque.sendMessage(chatId, { text: "🔍 _Génération d'un quiz..._" });
            const response = await axios.get("https://opentdb.com");
            const data = response.data.results[0];

            const questionFr = await translateToFrench(he.decode(data.question));
            const correctFr = await translateToFrench(he.decode(data.correct_answer));
            const incorrectsFr = await Promise.all(data.incorrect_answers.map(async ans => await translateToFrench(he.decode(ans))));
            
            const options = shuffleArray([...incorrectsFr, correctFr]);
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
              
