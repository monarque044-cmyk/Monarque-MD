import { saveSudo } from "../utils/configmanager.js";

const sudo = async (monarque, m, args) => {
    const chatId = m.key.remoteJid;
    const sender = m.key.participant || chatId;
    const cleanSender = sender.replace(/\D/g, '');
    
    // Protection : Seul le propriétaire ou un sudo peut utiliser cette commande
    if (cleanSender !== "22780828646") return; 

    const target = args[0]?.replace(/\D/g, '');
    if (!target) return await monarque.sendMessage(chatId, { text: "⚠️ Cite quelqu'un ou donne son numéro.\nEx: `.sudo 227XXXXXXXX`" });

    const added = saveSudo(target);
    if (added) {
        await monarque.sendMessage(chatId, { 
            text: `✨ *NOUVEAU SUDO* : @${target} a été ajouté à l'équipe Monarque.`,
            mentions: [target + "@s.whatsapp.net"]
        });
    } else {
        await monarque.sendMessage(chatId, { text: "⚠️ Cet utilisateur est déjà Sudo." });
    }
};

export default sudo;
