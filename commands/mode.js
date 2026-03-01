let publicMode = true; // Par défaut

const mode = async (monarque, m, args) => {
    const isSudo = m.isSudo; // On passera cette variable via le handler
    if (!isSudo) return;

    publicMode = !publicMode;
    const etat = publicMode ? "PUBLIC 🌍" : "PRIVÉ 🔐";
    
    await monarque.sendMessage(m.key.remoteJid, { 
        text: `🛡️ *MODE MONARQUE* : Le bot est maintenant en mode *${etat}*` 
    });
};

export { publicMode };
export default mode;
