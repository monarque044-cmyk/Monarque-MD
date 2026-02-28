import makeWASocket, { 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers 
} from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import configmanager from '../utils/configmanager.js';

const data = 'sessionData';

/**
 * ✅ Connexion Pure Monarque
 * @returns {Promise<import('@whiskeysockets/baileys').WASocket>}
 */
async function connectToWhatsapp() {
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(data);

    return new Promise(async (resolve) => {
        const sock = makeWASocket({
            version,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
            },
            printQRInTerminal: true, // Sécurité si le pairing échoue
            logger: pino({ level: 'silent' }),
            browser: Browsers.ubuntu("Chrome"),
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 30000, // Garde la connexion active
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                if (statusCode !== DisconnectReason.loggedOut) {
                    console.log('🔄 Reconnexion Monarque...');
                    setTimeout(() => connectToWhatsapp().then(resolve), 5000);
                }
            } else if (connection === 'open') {
                console.log('👑 MONARQUE MD : CONNEXION ÉTABLIE !');
                
                // Notification de démarrage
                try {
                    const myId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                    const messageText = `╔══════════════════╗\n      *𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 MD CONNECTÉ* 🚀\n╠══════════════════╣\n> "Toujours viser plus haut"\n╚══════════════════╝`;
                    await sock.sendMessage(myId, { text: messageText });
                } catch (e) {}

                resolve(sock); // ✅ On libère le socket vers l'index.js
            }
        });

        // --- PAIRING CODE (Si non connecté) ---
        if (!state.creds.registered) {
            const rawNumber = "22780828646"; 
            const cleanNumber = rawNumber.replace(/\D/g, ''); 

            setTimeout(async () => {
                try {
                    let code = await sock.requestPairingCode(cleanNumber);
                    code = code?.match(/.{1,4}/g)?.join("-") || code;
                    console.log(`\n📲 TON CODE DE JUMELAGE : ${code}\n`);
                } catch (e) { console.error('❌ Erreur Pairing:', e); }
            }, 5000);
        }
    });
}

export default connectToWhatsapp;
