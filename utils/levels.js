import fs from 'fs';

const dbPath = "./database/quiz_scores.json";

// Assure que le dossier et le fichier existent
if (!fs.existsSync("./database")) fs.mkdirSync("./database");
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

export const getPlayerData = (userId) => {
    const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    if (!data[userId]) {
        data[userId] = { xp: 0, level: 1, lastQuiz: 0 };
    }
    return data[userId];
};

export const addXp = (userId, amount) => {
    const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    if (!data[userId]) data[userId] = { xp: 0, level: 1 };
    
    data[userId].xp += amount;
    
    // Calcul du Level Up (Ex: 200 XP par niveau)
    const nextLevelXp = data[userId].level * 200;
    let leveledUp = false;
    
    if (data[userId].xp >= nextLevelXp) {
        data[userId].level += 1;
        data[userId].xp = 0;
        leveledUp = true;
    }
    
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    return { level: data[userId].level, leveledUp };
};
