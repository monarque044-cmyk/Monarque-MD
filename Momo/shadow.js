// 1. Correction des imports vers le nouveau package officiel
import makeWASocket, { 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore // Ajouté pour la stabilité
} from '@whiskeysockets/baileys'; 

import readline from 'readline';
import deployAsPremium from '../utils/MomoX.js';
import configmanager from '../utils/configmanager.js';
import pino from 'pino';
import fs from 'fs';

const data = 'sessionData';

async function connectToWhatsapp(handleMessage) {
    // Récupération de la version la plus stable
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`🤖 Monarque MD utilisant Baileys v${version} (Dernière : ${isLatest})`);

    const { state, saveCreds } = await useMultiFileAuthState(data);

    const sock = makeWASocket({
        version: version,
        auth: {
            creds: state.creds,
            // Utilisation d'un store de clés caché pour éviter l'erreur "container"
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        printQRInTerminal: false,
        syncFullHistory: false, // Mis à false pour éviter de saturer la RAM au démarrage
        markOnlineOnConnect: true,
        logger: pino({ level: 'silent' }),
        browser: ["Monarque MD", "Chrome", "1.0.0"], // Identité du bot
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            
            console.log(`❌ Connexion fermée. Raison: ${statusCode}. Reconnexion: ${shouldReconnect}`);
            
            if (shouldReconnect) {
                setTimeout(() => connectToWhatsapp(handleMessage), 5000);
            }
        } else if (connection === 'open') {
            console.log('✅ Monarque MD est en ligne !');

            // --- MESSAGE DE BIENVENUE ---
            try {
                const chatId = '22780828646@s.whatsapp.net'; 
                const imagePath = './database/DigixCo.jpg';
                const messageText = `🚀 *𝕄𝕠𝕟𝕒𝕣𝕢𝕦𝕖 MD Connecté*\n\n> "Always Dare to dream big"`;

                if (fs.existsSync(imagePath)) {
                    await sock.sendMessage(chatId, {
                        image: { url: imagePath },
                        caption: messageText
                    });
                } else {
                    await sock.sendMessage(chatId, { text: messageText });
                }
            } catch (err) {
                console.error('Erreur Welcome:', err);
            }
        }
    });

    // Gestion du Pairing Code
    if (!state.creds.registered) {
        const number = "22780828646"; // Format string recommandé
        console.log(`🔄 Génération du code de jumelage pour ${number}...`);
        
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(number);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(`📲 TON CODE DE JUMELAGE : ${code}`);
            } catch (e) {
                console.error('Erreur Pairing:', e);
            }
        }, 3000);
    }

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        handleMessage(sock, chatUpdate);
    });

    return sock;
}

export default connectToWhatsapp;
                      
