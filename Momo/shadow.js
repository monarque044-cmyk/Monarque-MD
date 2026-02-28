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

// ✅ On retire handleMessage des arguments pour laisser l'index gérer les événements
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
            printQRInTerminal: false,
            syncFullHistory: false,
            logger: pino({ level: 'silent' }),
            browser: Browsers.ubuntu("Chrome"), 
            connectTimeoutMs: 60000,
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                if (statusCode !== DisconnectReason.loggedOut) {
                    // Reconnexion sans argument
                    setTimeout(() => connectToWhatsapp(), 5000);
                }
            } else if (connection === 'open') {
                console.log('✅ Monarque MD : Connexion établie !');
                
                try {
                    const myId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                    const imagePath = './database/DigixCo.jpg';
                    const messageText = `╔══════════════════╗\n      *𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 MD Connecté* 🚀\n╠══════════════════╣\n> "Always Dare to dream big"\n╚══════════════════╝\n\n*𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 227*`;

                    if (fs.existsSync(imagePath)) {
                        await sock.sendMessage(myId, { image: { url: imagePath }, caption: messageText });
                    } else {
                        await sock.sendMessage(myId, { text: messageText });
                    }
                } catch (err) { console.error('❌ Erreur notification:', err); }

                resolve(sock); // On renvoie l'instance à l'index.js
            }
        });

        // --- PAIRING CODE ---
        if (!state.creds.registered) {
            const rawNumber = "22780828646"; 
            const cleanNumber = rawNumber.replace(/\D/g, ''); 

            setTimeout(async () => {
                try {
                    let code = await sock.requestPairingCode(cleanNumber);
                    code = code?.match(/.{1,4}/g)?.join("-") || code;
                    console.log(`\n📲 TON CODE DE JUMELAGE : ${code}\n`);
                    
                    if (!configmanager.config.users[cleanNumber]) {
                        configmanager.config.users[cleanNumber] = {
                            sudoList: [`${cleanNumber}@s.whatsapp.net`],
                            prefix: '.',
                            response: true,
                        };
                        configmanager.save();
                    }
                } catch (e) { console.error('❌ Erreur Pairing Code:', e); }
            }, 3000);
        }
    });
}

export default connectToWhatsapp; // L'exportation par défaut
