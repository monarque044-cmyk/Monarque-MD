import axios from "axios";
import he from "he";
import fs from "fs";

// ✅ Export des jeux en cours pour le handler
export const triviaGames = {}; 
const dbPath = "./database.json";

// Initialisation de la DB sécurisée
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

// ✅ API Traduction Fixée
async function translateToFrench(text) {
    try {
        const res = await axios.get(`https://translate.googleapis.com{encodeURIComponent(text)}`);
        return res.data[0][0][0] || text;
    } catch { return text; }
}

export default {
    name: 'quiz',
    description: 'Jeu de culture générale avec système de niveaux',

    async execute(monarque, m, args) {
        const chatId = m.chat || m.key.remoteJid;
        const userId = m.key.participant || m.key.remoteJid;
        const input = args.join(" ").trim().toLowerCase();

        try {
            // --- CLASSEMENT ---
            if (input === "top") {
                const data = getScores();
                const top = Object.entries(data)
                    .sort((a, b) => (b[1].level || 0) - (a[1].level || 0))
                    .slice(0, 10);

                if (top.length === 0) return monarque.sendMessage(chatId, { text: "🏆 Aucun score enregistré." });

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
                    return monarque.sendMessage(chatId, { text: "❌ Tu dois être niveau *100* pour passer un prestige !" });
                }
                data[userId].prestige = (data[userId].prestige || 0) + 1;
                data[userId].level = 1;
                data[userId].xp = 0;
                saveScores(data);
                return monarque.sendMessage(chatId, { text: `✨ *PRESTIGE UP !* @${userId.split('@')[0]} est Rang *${data[userId].prestige}* !`, mentions: [userId] });
            }

            // --- VÉRIFICATION RÉPONSE ---
            if (triviaGames[chatId]) {
                const game = triviaGames[chatId];
                const selectedIndex = parseInt(input);
                let userCorrect = false;

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
                } else if (input.length > 0) {
                    // On ne répond rien si c'est juste une erreur de frappe, pour éviter le spam
                    return; 
                }
            }

            // --- NOUVELLE QUESTION ---
            if (triviaGames[chatId]) return; // Un quiz est déjà en cours

            await monarque.sendMessage(chatId, { text: "⏳ _Génération d'une question Monarque..._" });

            // ✅ URL API OpenTDB FIXÉE
            const qRes = await axios.get("https://opentdb.com");
            const qData = qRes.data.results[0];

            const questionFr = await translateToFrench(he.decode(qData.question));
            const correctFr = await translateToFrench(he.decode(qData.correct_answer));
            const incorrectsFr = await Promise.all(qData.incorrect_answers.map(ans => translateToFrench(he.decode(ans))));

            const options = [...incorrectsFr, correctFr].sort(() => Math.random() - 0.5);
            triviaGames[chatId] = { correctAnswer: correctFr, options };

            const optionsTxt = options.map((opt, i) => `*${i + 1}️)* ${opt}`).join("\n");
            
            await monarque.sendMessage(chatId, { 
                text: `🧠 *QUIZ MONARQUE*\n\n*Question :* ${questionFr}\n\n${optionsTxt}\n\n👉 Réponds par le *numéro* !` 
            });

        } catch (err) {
            console.error(err);
            delete triviaGames[chatId];
            return monarque.sendMessage(chatId, { text: "❌ Erreur API. Réessaie plus tard." });
        }
    }
};
            
