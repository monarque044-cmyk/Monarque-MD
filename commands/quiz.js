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
        // ✅ URL Google Translate Corrigée
        const res = await axios.get(`https://translate.googleapis.com{encodeURIComponent(text)}`);
        return res.data[0][0][0] || text;
    } catch { return text; }
}

// ✅ Transformation en fonction directe pour messageHandler
const quiz = async (monarque, m, args) => {
    const chatId = m.key.remoteJid;
    const userId = m.key.participant || m.key.remoteJid;
    const input = args.join(" ").trim();

    // ================== CLASSEMENT (TOP) ==================
    if (input === "top") {
        const data = getScores();
        const top = Object.entries(data)
            .sort((a, b) => (b[1].level || 0) - (a[1].level || 0))
            .slice(0, 10);

        // ================== COMMANDE PRESTIGE ==================
if (input === "prestige") {
    let data = getScores();
    const stats = data[userId];

    if (!stats || stats.level < 100) {
        return monarque.sendMessage(chatId, { text: "❌ Tu dois être niveau *100* pour passer un prestige !" });
    }

    // On réinitialise le niveau mais on augmente le prestige
    stats.prestige += 1;
    stats.level = 1;
    stats.xp = 0;
    stats.coins += 1000; // Prime de prestige

    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

    const prestigeTxt = `✨ *ASCENSION DE PRESTIGE* ✨\n\n` +
                       `@${userId.split('@')[0]} a atteint le Rang de Prestige *${stats.prestige}* !\n` +
                       `🎖️ Médaille de prestige obtenue.\n` +
                       `💰 Bonus de +1000 pièces reçu.\n` +
                       `📈 Vos gains d'XP sont désormais boostés de ${stats.prestige * 10}% !`;

    return monarque.sendMessage(chatId, { text: prestigeTxt, mentions: [userId] });
}

        if (top.length === 0) return monarque.sendMessage(chatId, { text: "🏆 Aucun score enregistré." });

        let txt = "🏆 *HALL OF FAME - QUIZ MONARQUE* 🏆\n\n";
        top.forEach((user, i) => {
            const jid = user[0];
            const stats = user[1];
            let emoji = (i === 0) ? "🥇" : (i === 1) ? "🥈" : (i === 2) ? "🥉" : `${i + 1}.`;
            txt += `${emoji} @${jid.split("@")[0]}\n└─ Niveau : *${stats.level || 1}* | XP : *${stats.xp || 0}*\n\n`;
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

        // ================== RÉPONSE À UNE QUESTION (AVEC PRESTIGE) ==================
if (isCorrect) {
    let data = getScores();
    if (!data[userId]) data[userId] = { xp: 0, level: 1, prestige: 0, coins: 0 };

    // Bonus de Prestige : +10% de gains par rang de prestige
    const bonusMultiplier = 1 + (data[userId].prestige * 0.1);
    const xpGagne = Math.round(50 * bonusMultiplier);
    const coinsGagnes = Math.round(25 * bonusMultiplier);

    data[userId].xp += xpGagne;
    data[userId].coins += coinsGagnes;

    let msgFin = `🎉 *BIEN JOUÉ @${userId.split('@')[0]} !*\n`;
    msgFin += `✅ Réponse : *${game.correctAnswer}*\n`;
    msgFin += `💰 +${coinsGagnes} pièces | 🌟 +${xpGagne} XP`;

    // --- LOGIQUE LEVEL UP ---
    const xpNeeded = data[userId].level * 150;
    if (data[userId].xp >= xpNeeded) {
        data[userId].level += 1;
        data[userId].xp = 0;
        msgFin += `\n\n🎊 *LEVEL UP !* Tu es niveau *${data[userId].level}* !`;

        // --- CONDITION DE PRESTIGE (Niveau 100) ---
        if (data[userId].level >= 100) {
            msgFin += `\n\n✨ *INCROYABLE !* Tu as atteint le niveau 100 !\n👉 Tape *.quiz prestige* pour passer au rang supérieur !`;
        }
    }

    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    await monarque.sendMessage(chatId, { text: msgFin, mentions: [userId] }, { quoted: m });
    delete triviaGames[chatId];
    return;
}
        

    // ================== NOUVELLE QUESTION ==================
    if (triviaGames[chatId]) return monarque.sendMessage(chatId, { text: "⚠️ Un quiz est déjà lancé !" });

    try {
        await monarque.sendMessage(chatId, { text: "🔍 _Génération d'un quiz..._" });
        // ✅ URL API OpenTDB Corrigée
        const response = await axios.get("https://opentdb.com");
        const qData = response.data.results[0];

        const questionFr = await translateToFrench(he.decode(qData.question));
        const correctFr = await translateToFrench(he.decode(qData.correct_answer));
        const incorrectsFr = await Promise.all(qData.incorrect_answers.map(async ans => await translateToFrench(he.decode(ans))));
        
        const options = [...incorrectsFr, correctFr].sort(() => Math.random() - 0.5);
        triviaGames[chatId] = { correctAnswer: correctFr, options };

        const optionsText = options.map((opt, i) => `*${i + 1}️)* ${opt}`).join("\n");
        await monarque.sendMessage(chatId, { 
            text: `🧠 *QUIZ MONARQUE*\n\n*Question :* ${questionFr}\n\n${optionsText}\n\n👉 Réponds : \`.quiz <numéro>\`\n🏆 Top : \`.quiz top\`` 
        });
    } catch (err) {
        console.error(err);
        await monarque.sendMessage(chatId, { text: "❌ Erreur de génération. Réessaie." });
    }
};

// ✅ Pour la détection automatique des réponses dans messageHandler
quiz.execute = quiz; 

export default quiz;
    
