import axios from "axios";
import he from "he";
import fs from "fs";

export const triviaGames = {}; 
const dbPath = "./database/quiz_scores.json"; // Dossier database recommandé

// Initialisation de la DB sécurisée
if (!fs.existsSync("./database")) fs.mkdirSync("./database");
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

const getScores = () => {
    try {
        return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    } catch { return {}; }
};

const saveScores = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

const normalizeText = (str) => {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

// ✅ API Traduction 2025 Fixée
async function translateToFrench(text) {
    try {
        // Utilisation de l'API Google Translate libre
        const res = await axios.get(`https://translate.googleapis.com{encodeURIComponent(text)}`);
        return res.data[0][0][0] || text;
    } catch { return text; }
}

export default {
    name: 'quiz',
    description: 'Jeu de culture générale avec système de niveaux',

    async execute(monarque, m, args) {
        const chatId = m.key.remoteJid;
        const userId = m.key.participant || m.key.remoteJid;
        // On récupère l'input proprement (soit vide pour une nouvelle question, soit la réponse)
        const input = (Array.isArray(args) ? args.join(" ") : args).trim().toLowerCase();

        try {
            // --- CLASSEMENT ---
            if (input === "top") {
                const data = getScores();
                const top = Object.entries(data)
                    .sort((a, b) => (b[1].level || 0) - (a[1].level || 0))
                    .slice(0, 10);

                if (top.length === 0) return monarque.sendMessage(chatId, { text: "🏆 Aucun score enregistré sur Monarque." });

                let txt = "🏆 *HALL OF FAME - MONARQUE* 🏆\n\n";
                top.forEach((user, i) => {
                    const stats = user[1];
                    let emoji = (i === 0) ? "🥇" : (i === 1) ? "🥈" : (i === 2) ? "🥉" : `${i + 1}.`;
                    txt += `${emoji} @${user[0].split("@")[0]}\n└─ Niveau : *${stats.level || 1}* | Prestige : *${stats.prestige || 0}*\n\n`;
                });
                return monarque.sendMessage(chatId, { text: txt, mentions: top.map(u => u[0]) });
            }

            // --- PRESTIGE ---
            if (input === "prestige") {
                let data = getScores();
                if (!data[userId] || data[userId].level < 100) {
                    return monarque.sendMessage(chatId, { text: "❌ Tu dois être niveau *100* pour passer un prestige Monarque !" });
                }
                data[userId].prestige = (data[userId].prestige || 0) + 1;
                data[userId].level = 1;
                data[userId].xp = 0;
                saveScores(data);
                return monarque.sendMessage(chatId, { text: `✨ *PRESTIGE UP !* @${userId.split('@')[0]} est désormais Rang *${data[userId].prestige}* !`, mentions: [userId] });
            }

            // --- LOGIQUE DE JEU ---
            if (triviaGames[chatId]) {
                const game = triviaGames[chatId];
                const selectedIndex = parseInt(input);
                let userCorrect = false;

                // Vérification par numéro ou par texte
                if (!isNaN(selectedIndex) && selectedIndex >= 1 && selectedIndex <= game.options.length) {
                    if (game.options[selectedIndex - 1] === game.correctAnswer) userCorrect = true;
                } else if (normalizeText(input) === normalizeText(game.correctAnswer)) {
                    userCorrect = true;
                }

                if (userCorrect) {
                    let data = getScores();
                    if (!data[userId]) data[userId] = { xp: 0, level: 1, prestige: 0 };
                    
                    const xpGagne = 50 + (data[userId].prestige * 10);
                    data[userId].xp += xpGagne;

                    let msg = `✅ *BRAVO @${userId.split('@')[0]} !*\nLa réponse était : *${game.correctAnswer}*\n🌟 +${xpGagne} XP`;

                    if (data[userId].xp >= (data[userId].level * 200)) {
                        data[userId].level++;
                        data[userId].xp = 0;
                        msg += `\n\n🎊 *LEVEL UP !* Tu es niveau *${data[userId].level}* !`;
                    }

                    saveScores(data);
                    delete triviaGames[chatId];
                    return monarque.sendMessage(chatId, { text: msg, mentions: [userId] }, { quoted: m });
                } else if (input.length > 0 && !isNaN(selectedIndex)) {
                    return monarque.sendMessage(chatId, { text: "❌ Mauvaise réponse ! Réessaye ou attends la prochaine question." });
                }
                return; 
            }

            // --- NOUVELLE QUESTION ---
            await monarque.sendMessage(chatId, { text: "⏳ _Génération d'une question Monarque..._" });

            // ✅ URL API OpenTDB FIXÉE (Ajout de amount=1 et type=multiple)
            const qRes = await axios.get("https://opentdb.com", { timeout: 10000 });
            
            if (!qRes.data.results || qRes.data.results.length === 0) throw new Error("Pas de données");
            
            const qData = qRes.data.results[0];

            // Traduction des éléments
            const questionFr = await translateToFrench(he.decode(qData.question));
            const correctFr = await translateToFrench(he.decode(qData.correct_answer));
            const incorrectsFr = await Promise.all(qData.incorrect_answers.map(ans => translateToFrench(he.decode(ans))));

            const options = [...incorrectsFr, correctFr].sort(() => Math.random() - 0.5);
            triviaGames[chatId] = { correctAnswer: correctFr, options };

            const optionsTxt = options.map((opt, i) => `*${i + 1}️)* ${opt}`).join("\n");
            
            const quizMsg = `🧠 *QUIZ MONARQUE*\n\n` +
                          `*Question :* ${questionFr}\n\n` +
                          `${optionsTxt}\n\n` +
                          `👉 Réponds par le *numéro* !\n` +
                          `> Always Dare to dream big`;

            await monarque.sendMessage(chatId, { text: quizMsg }, { quoted: m });

        } catch (err) {
            console.error("[QUIZ ERROR]:", err.message);
            delete triviaGames[chatId];
            return monarque.sendMessage(chatId, { text: "❌ *Erreur Monarque* : L'API de Quiz est saturée ou indisponible." });
        }
    }
};
                
