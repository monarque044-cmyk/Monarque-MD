import pkg from '@whiskeysockets/baileys';
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    Browsers 
} = pkg;
import pino from 'pino';

async function connectToWhatsapp() {
    // Gestion de l'état de connexion (session)
    const { state, saveCreds } = await useMultiFileAuthState('session_monarque');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: false, // On force le Pairing Code
        browser: Browsers.ubuntu("Chrome"),
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 0,
        keepAliveIntervalMs: 10000
    });

    // Demande du Pairing Code si non connecté
    if (!sock.authState.creds.registered) {
        const phoneNumber = "22780828646"; // Ton numéro
        setTimeout(async () => {
            let code = await sock.requestPairingCode(phoneNumber);
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            console.log(`\n👑 MONARQUE MD 👑\n📲 CODE DE JUMELAGE : ${code}\n`);
        }, 3000);
    }

    // Sauvegarde des identifiants
    sock.ev.on('creds.update', saveCreds);

    // Gestion des mises à jour de connexion
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('🔄 Connexion perdue. Reconnexion en cours...', shouldReconnect);
            if (shouldReconnect) connectToWhatsapp();
        } else if (connection === 'open') {
            console.log('✅ MONARQUE MD : CONNEXION ÉTABLIE !');
        }
    });
    
// --- JUSTE APRÈS : sock.ev.on('connection.update', ... ) ---

sock.ev.on('group-participants.update', async (anu) => {
    const { id, participants, action } = anu;
    
    // On ne réagit que si quelqu'un REJOINT le groupe
    if (action === 'add') {
        for (const num of participants) {
            try {
                // Récupération de la photo de profil (ou image par défaut)
                const ppUrl = await sock.profilePictureUrl(num, 'image').catch(() => 'https://telegra.ph');
                const metadata = await sock.groupMetadata(id);
                
                let welcomeTxt = `🌟 *𝔹𝕚𝕖𝕟𝕧𝕖𝕟𝕦𝕖 𝕔𝕙𝕖𝕫 𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖* 🌟\n\n`;
                welcomeTxt += `👤 *Membre* : @${num.split('@')[0]}\n`;
                welcomeTxt += `🏰 *Groupe* : ${metadata.subject}\n\n`;
                welcomeTxt += `> Respecte les règles et profite bien !`;

                await sock.sendMessage(id, { 
                    image: { url: ppUrl }, 
                    caption: welcomeTxt,
                    mentions: [num]
                });
            } catch (e) { 
                console.error("Erreur Welcome Monarque:", e); 
            }
    }
});
    
    return sock;
}

export default connectToWhatsapp;
