const dlt = async (monarque, m) => {
    try {
        const quoted = m.message?.extendedTextMessage?.contextInfo;
        if (!quoted?.stanzaId) return;

        await monarque.sendMessage(m.key.remoteJid, {
            delete: {
                remoteJid: m.key.remoteJid,
                fromMe: quoted.participant === monarque.user.id,
                id: quoted.stanzaId,
                participant: quoted.participant
            }
        });
    } catch (err) {
        await monarque.sendMessage(m.key.remoteJid, { text: "❌ Je n'ai pas les permissions pour supprimer ce message." });
    }
};

export default dlt;
