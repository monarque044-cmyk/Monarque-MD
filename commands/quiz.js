import axios from "axios";
import he from "he";

const triviaGames = {}; 

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function normalizeText(str) {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

async function translateToFrench(text) {
  try {
    const res = await axios.get(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=fr&dt=t&q=${encodeURIComponent(text)}`
    );
    // Structure exacte de l'API Google Translate gratuite
    return res.data[0][0][0] || text;
  } catch (err) {
    return text; 
  }
}

export default {
  name: "quiz",
  alias: ["trivia", "question"],
  category: "Fun",
  description: "Démarre un quiz ou répond à une question en cours",

  async execute(monarque, m, args) {
    const chatId = m.chat;
    const input = args.join(" ").trim();

    // ================== RÉPONSE À UNE QUESTION ==================
    if (input.length > 0) {
      if (!triviaGames[chatId]) {
        return monarque.sendMessage(chatId, { text: "❌ Aucune partie en cours. Tape `.quiz` pour commencer." }, { quoted: m });
      }

      const game = triviaGames[chatId];
      let isCorrect = false;
      const index = parseInt(input, 10);

      // Vérification par numéro (1, 2, 3...)
      if (!isNaN(index) && index >= 1 && index <= game.options.length) {
        if (normalizeText(game.options[index - 1]) === normalizeText(game.correctAnswer)) isCorrect = true;
      } 
      // Vérification par texte direct
      else if (normalizeText(input) === normalizeText(game.correctAnswer)) {
        isCorrect = true;
      }

      if (isCorrect) {
        await monarque.sendMessage(chatId, { 
          text: `🎉 *Bravo @${m.sender.split('@')[0]} !*\n\nC'est la bonne réponse : *${game.correctAnswer}*`, 
          mentions: [m.sender] 
        }, { quoted: m });
      } else {
        await monarque.sendMessage(chatId, { 
          text: `❌ Dommage ! Ce n'est pas la bonne réponse.\n\nLa réponse était : *${game.correctAnswer}*` 
        }, { quoted: m });
      }
      delete triviaGames[chatId];
      return;
    }

    // ================== NOUVELLE QUESTION ==================
    if (triviaGames[chatId]) {
        return monarque.sendMessage(chatId, { text: "⚠️ Un quiz est déjà lancé ! Réponds avec `.quiz <numéro>`." }, { quoted: m });
    }

    try {
      await monarque.sendMessage(chatId, { text: "🔍 _Recherche d'une question..._" }, { quoted: m });

      const response = await axios.get("https://opentdb.com/api.php?amount=1&type=multiple");
      const data = response.data.results[0]; // On récupère le premier objet de l'index

      // Décodage et traduction
      const questionFr = await translateToFrench(he.decode(data.question));
      const correctFr = await translateToFrench(he.decode(data.correct_answer));
      const incorrectsFr = await Promise.all(data.incorrect_answers.map(async (ans) => await translateToFrench(he.decode(ans))));
      
      const options = shuffleArray([...incorrectsFr, correctFr]);

      triviaGames[chatId] = {
        correctAnswer: correctFr,
        options: options
      };

      const optionsText = options.map((opt, i) => `*${i + 1}️)* ${opt}`).join("\n");

      await monarque.sendMessage(chatId, { 
        text: `🧠 *QUIZ MONARQUE* 🧠\n\n*Question :* ${questionFr}\n\n*Options :*\n${optionsText}\n\n👉 Réponds avec : \`.quiz <numéro>\`` 
      }, { quoted: m });

    } catch (err) {
      console.error("Erreur Quiz Monarque:", err);
      await monarque.sendMessage(chatId, { text: "❌ Erreur technique lors de la génération du quiz." }, { quoted: m });
    }
  }
};
          
