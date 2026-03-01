import axios from 'axios';
import he from 'he';
import fs from 'fs';

// Stockage des jeux en cours (Global)
export const triviaGames = {}; 
const dbPath = "./database/quiz_scores.json";

// Initialisation de la DB
if (!fs.existsSync("./database")) fs.mkdirSync("./database");
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

const getScores = () => JSON.parse(fs.readFileSync(dbPath, "utf-8"));
const saveScores = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

const quiz = async (monarque, m, args) => {
    const chatId = m.key.remoteJid;
    const userId = m.key.participant || m.key.remoteJid;

    try {
        // --- 1. GÉNÉRATION DE LA QUESTION ---
        await monarque.sendMessage(chatId, { text: "⏳ _Recherche d'une question Monarque..._" });

        const res = await axios.get("https://opentdb.com", { timeout: 10000 });
        
        if (res.data.response_code !== 0) throw new Error("API Trivia saturée");

        const qData = res.data.results[0];
        const question = he.decode(qData.question);
        const correctAnswer = he.decode(qData.correct_answer);
        const incorrectAnswers = qData.incorrect_answers.map(ans => he.decode(ans));

        // Mélange des options
        const options = [...incorrectAnswers, correctAnswer].sort(() => Math.random() - 0.5);
        const correctIndex = options.indexOf(correctAnswer) + 1;

        // --- 2. STOCKAGE DU JEU ---
        triviaGames[chatId] = {
            correctAnswer: correctAnswer,
            correctIndex: correctIndex,
            options: options
        };

        // --- 3. AFFICHAGE ---
        let quizMsg = `🧠 *QUIZ MONARQUE MD*\n\n`;
        quizMsg += `📝 *Question* : ${question}\n\n`;
        options.forEach((opt, i) => {
            quizMsg += `${i + 1}️⃣ ${opt}\n`;
        });
        quizMsg += `\n👉 *Réponds par le chiffre (1-4)*\n`;
        quizMsg += `> ⏱️ Tu as 30 secondes !`;

        await monarque.sendMessage(chatId, { text: quizMsg }, { quoted: m });

        // Auto-suppression après 30s
        setTimeout(() => {
            if (triviaGames[chatId]) {
                monarque.sendMessage(chatId, { text: `⏰ *Temps écoulé !*\nLa réponse était : *${correctAnswer}*` });
                delete triviaGames[chatId];
            }
        }, 30000);

    } catch (err) {
        console.error("[QUIZ ERROR]:", err.message);
        await monarque.sendMessage(chatId, { text: "❌ Erreur API. Réessaye dans un instant." });
    }
};

export default quiz;
                                     
