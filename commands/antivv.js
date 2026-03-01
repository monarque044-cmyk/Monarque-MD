import fs from 'fs';

const settingsPath = "./database/settings.json";

export default {
    name: 'antivv',
    async execute(monarque, m, args) {
        const chatId = m.key.remoteJid;
        if (!m.isSudo) return; // Sécurité Sudo

        let settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
        if (!settings[chatId]) settings[chatId] = { antivv: false };

        // Toggle ON/OFF
        settings[chatId].antivv = !settings[chatId].antivv;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        const status = settings[chatId].antivv ? "ACTIVÉ ✅" : "DÉSACTIVÉ ❌";
        await monarque.sendMessage(chatId, { text: `🛡️ *Anti-ViewOnce* est maintenant *${status}* sur ce chat.` });
    }
};
