import axios from "axios";
import he from "he";
import fs from "fs";

export const triviaGames = {}; 
const dbPath = "./database/quiz_scores.json";

// Initialisation sécurisée
if (!fs.existsSync("./database")) fs.mkdirSync("./database");
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

const getScores = () => {
    try { return JSON.parse(fs.readFileSync(dbPath, "utf-8")); } 
    catch { return {}; }
};

const saveScores = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// ✅ Traducteur Google 2026 (Plus stable)
async function translateToFrench(text) {
    try {
        const res = await axios.get(`https://translate.googleapis.com{encodeURIComponent(text)}`, { timeout: 5000 });
        return res.data[0][0][0] || text;
    } catch { return text; }
}

export default {
    name: 'quiz',
    description: 'Jeu de culture générale avec système de niveaux',

    async execute(monarque, m, args) {
        const chatId = m.key.remoteJid;
        const userId = m.key.participant || m.key.remoteJid;
        const input = (Array.isArray(args) ? args.join(" ") : args).trim().toLowerCase();

        try {
            // --- LOGIQUE DE SCORE / TOP / PRESTIGE (Inchangée pour garder tes données) ---
            if (input === "top" || input === "prestige") {
                // ... (Garde ton code précédent pour ces fonctions ici)
            }

            // --- VÉRIFICATION RÉPONSE EN COURS ---
            if (triviaGames[chatId]) {
                const game = triviaGames[chatId];
                const selectedIndex = parseInt(input);
                let userCorrect = false;

                if (!isNaN(selectedIndex) && selectedIndex >= 1 && selectedIndex <= game.options.length) {
                    if (game.options[selectedIndex - 1] === game.correctAnswer) userCorrect = true;
                }

                if (userCorrect) {
                    let data = getScores();
                    if (!data[userId]) data[userId] = { xp: 0, level: 1, prestige: 0 };
                    const xpGagne = 50 + (data[userId].prestige * 10);
                    data[userId].xp += xpGagne;
                    let msg = `✅ *BRAVO @${userId.split('@')[0]} !*\n🌟 +${xpGagne} XP`;
                    if (data[userId].xp >= (data[userId].level * 200)) {
                        data[userId].level++; data[userId].xp = 0;
                        msg += `\n🎊 *LEVEL UP !* Niveau *${data[userId].level}* !`;
                    }
                    saveScores(data); delete triviaGames[chatId];
                    return monarque.sendMessage(chatId, { text: msg, mentions: [userId] }, { quoted: m });
                } else if (!isNaN(selectedIndex)) {
                    return; // On ignore les mauvaises réponses pour éviter le spam
                }
            }

            // --- GÉNÉRATION D'UNE NOUVELLE QUESTION ---
            if (triviaGames[chatId]) return; 

            await monarque.sendMessage(chatId, { text: "⏳ _Génération d'une question Monarque..._" });

            // 🔄 TENTATIVE DE CONNEXION API OPENTDB
            const qRes = await axios.get("https://opentdb.com", { timeout: 8000 });
            
            // ✅ DÉTECTION PRÉCISE DES ERREURS API
            const responseCode = qRes.data.response_code;
            if (responseCode !== 0) {
                let errorMsg = "L'API est saturée.";
                if (responseCode === 1) errorMsg = "Plus de questions disponibles dans cette catégorie.";
                if (responseCode === 5) errorMsg = "Trop de requêtes rapides (Rate Limit). Attends 5s.";
                
                throw new Error(errorMsg);
            }

            const qData = qRes.data.results[0];

            // Traduction en parallèle pour plus de rapidité
            const [questionFr, correctFr, ...incorrectsFr] = await Promise.all([
                translateToFrench(he.decode(qData.question)),
                translateToFrench(he.decode(qData.correct_answer)),
                ...qData.incorrect_answers.map(ans => translateToFrench(he.decode(ans)))
            ]);

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
            console.error("[QUIZ DEBUG]:", err.message);
            delete triviaGames[chatId];
            
            // Message d'erreur intelligent
            const details = err.message.includes("timeout") ? "Délai d'attente dépassé (Serveur lent)." : err.message;
            return monarque.sendMessage(chatId, { 
                text: `❌ *Erreur Monarque* : ${details}\n_Réessaie dans un instant._` 
            });
        }
    }
};
                        
