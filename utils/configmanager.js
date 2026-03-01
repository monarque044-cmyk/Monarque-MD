import fs from 'fs';

const path = './database/config.json';
if (!fs.existsSync('./database')) fs.mkdirSync('./database');
if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({ sudos: ["22780828646"] })); // Ton numéro par défaut

export const getConfig = () => JSON.parse(fs.readFileSync(path, 'utf-8'));
export const saveSudo = (number) => {
    const config = getConfig();
    if (!config.sudos.includes(number)) {
        config.sudos.push(number);
        fs.writeFileSync(path, JSON.stringify(config, null, 2));
        return true;
    }
    return false;
};
