import makeWASocket, { 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers // ✅ Ajouté pour la compatibilité Pairing
} from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import configmanager from '../utils/configmanager.js';

const data = 'sessionData';

async function connectToWhatsapp(handleMessage) {
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(data);

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        printQRInTerminal: false,
        syncFullHistory: false,
        logger: pino({ level: 'silent' }),
        // ✅ Correction : Browser spécifique requis pour le Pairing Code stable
        browser: Browsers.ubuntu("Chrome"), 
        connectTimeoutMs: 60000,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            if (statusCode !== DisconnectReason.loggedOut) {
                setTimeout(() => connectToWhatsapp(handleMessage), 5000);
            }
        } else if (connection === 'open') {
            console.log('✅ Monarque MD : Connexion établie !');

            try {
                // ✅ Notification dynamique : s'envoie au numéro connecté
                const myId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                const imagePath = './database/DigixCo.jpg';
                const messageText = `╔══════════════════╗\n      *𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 MD Connecté* 🚀\n╠══════════════════╣\n> "Always Dare to dream big"\n╚══════════════════╝\n\n*𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 227*`;

                if (fs.existsSync(imagePath)) {
                    await sock.sendMessage(myId, { image: { url: imagePath }, caption: messageText });
                } else {
                    await sock.sendMessage(myId, { text: messageText });
                }
            } catch (err) {
                console.error('❌ Erreur notification:', err);
            }
        }
    });

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        handleMessage(sock, chatUpdate);
    });

    // --- LOGIQUE PAIRING CODE ---
    if (!state.creds.registered) {
        const rawNumber = "22780828646"; 
        const cleanNumber = rawNumber.replace(/\D/g, ''); // Nettoie le numéro

        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(cleanNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(`\n📲 TON CODE DE JUMELAGE : ${code}\n`);
                
                // Config utilisateur
                configmanager.config.users[cleanNumber] = {
                    sudoList: [`${cleanNumber}@s.whatsapp.net`],
                    prefix: '.',
                    response: true,
                };
                configmanager.save();
            } catch (e) {
                console.error('❌ Erreur Pairing Code:', e);
            }
        }, 3000); // 3 secondes suffisent
    }

    return sock;
}

export default connectToWhatsapp;
