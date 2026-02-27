// 1. Correction des imports vers le nouveau package officiel
import makeWASocket, { 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore // ✅ Indispensable pour la stabilité des clés
} from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import configmanager from '../utils/configmanager.js';

// Garde tes autres imports (MomoX, etc.) s'ils sont nécessaires

const data = 'sessionData';

async function connectToWhatsapp(handleMessage) {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`🤖 Monarque MD : Baileys v${version}`);

    const { state, saveCreds } = await useMultiFileAuthState(data);

    const sock = makeWASocket({
        version: version,
        // ✅ Correction : On enveloppe les clés dans makeCacheableSignalKeyStore
        // Cela évite l'erreur "Cannot find container"
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        printQRInTerminal: false,
        syncFullHistory: false, // Mis à false pour économiser la RAM
        markOnlineOnConnect: true,
        logger: pino({ level: 'silent' }),
        browser: ["Monarque MD", "Chrome", "1.0.0"], // Identité du bot
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 0,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            
            console.log(`❌ Déconnecté. Raison: ${statusCode}. Reconnexion: ${shouldReconnect}`);
            
            if (shouldReconnect) {
                // On évite les boucles infinies en attendant 5s
                setTimeout(() => connectToWhatsapp(handleMessage), 5000);
            }
        } else if (connection === 'open') {
            console.log('✅ Connexion établie avec succès !');

            // --- WELCOME MESSAGE ---
            try {
                const chatId = '22780828646@s.whatsapp.net';
                const imagePath = './database/DigixCo.jpg';
                const messageText = `╔══════════════════╗\n      *𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 MD Connecté* 🚀\n╠══════════════════╣\n> "Always Dare to dream big"\n╚══════════════════╝\n\n*𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 227*`;

                if (fs.existsSync(imagePath)) {
                    await sock.sendMessage(chatId, { image: { url: imagePath }, caption: messageText });
                } else {
                    await sock.sendMessage(chatId, { text: messageText });
                }
            } catch (err) {
                console.error('❌ Erreur message de bienvenue:', err);
            }
        }
    });

    // Écoute des messages
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        // On passe 'sock' au handler (qui sera renommé 'monarque' dans tes commandes)
        handleMessage(sock, chatUpdate);
    });

    // --- LOGIQUE PAIRING CODE ---
    if (!state.creds.registered) {
        const number = "22780828646"; // Utilise un format String
        console.log(`🔄 Génération du code pour : ${number}`);

        setTimeout(async () => {
            try {
                // Demande du code
                let code = await sock.requestPairingCode(number);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(`📲 TON CODE DE JUMELAGE : ${code}`);
                
                // Sauvegarde config utilisateur
                configmanager.config.users[number] = {
                    sudoList: [`${number}@s.whatsapp.net`],
                    prefix: '.',
                    response: true,
                    record: true,
                    welcome: false,
                };
                configmanager.save();
            } catch (e) {
                console.error('❌ Erreur Pairing Code:', e);
            }
        }, 5000);
    }

    return sock; // Crucial pour ton index.js
}

export default connectToWhatsapp;
               
