import fs from 'fs'
import path from 'path'

const configPath = 'config.json'
const premiumPath = 'db.json'

// Initialisation de la Config
let config = { users: {} };
if (fs.existsSync(configPath)) {
    try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        console.log('✅ Config chargée avec succès !');
    } catch (e) {
        console.log('⚠️ Erreur lecture config.json, réinitialisation...');
        config = { users: {} };
    }
} else {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

// Initialisation des Premiums
let premiums = { premiumUser: {} };
if (fs.existsSync(premiumPath)) {
    try {
        premiums = JSON.parse(fs.readFileSync(premiumPath, 'utf-8'));
    } catch (e) {
        premiums = { premiumUser: {} };
    }
}

const saveConfig = () => {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('💾 Config sauvegardée.');
};

const savePremium = () => {
    fs.writeFileSync(premiumPath, JSON.stringify(premiums, null, 2));
    console.log('💾 Premiums sauvegardés.');
};

export default {
    config,
    premiums,
    save() { saveConfig(); },
    saveP() { savePremium(); },
    
    // ✅ Fonction utilitaire pour éviter les erreurs "undefined"
    getUser(number) {
        if (!config.users[number]) {
            config.users[number] = {
                sudoList: [],
                prefix: '.',
                publicMode: true,
                autoreact: false
            };
            saveConfig();
        }
        return config.users[number];
    }
}
