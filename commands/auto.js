import configmanager from '../utils/configmanager.js'

export async function autorecord(client, message) {
    try {
        const remoteJid = message.key.remoteJid
        const number = client.user.id.split(':')[0]
        
        // 🔹 Vérification de la config
        if (!configmanager.config.users[number]) return
        if (!configmanager.config.users[number].record) return
        
        // ❌ COMMENTER CETTE LIGNE POUR ARRÊTER L'ENREGISTREMENT
        // await client.sendPresenceUpdate('recording', remoteJid)
        
        // On force le statut à "disponible" immédiatement pour annuler tout reste
        await client.sendPresenceUpdate('available', remoteJid)
        
    } catch (error) {
        console.error('Autorecord error:', error)
    }
}

export async function autotype(client, message) {
    try {
        const remoteJid = message.key.remoteJid
        const number = client.user.id.split(':')[0]
        
        if (!configmanager.config.users[number]) return
        if (!configmanager.config.users[number].type) return
        
        // ❌ COMMENTER CETTE LIGNE POUR ARRÊTER LE "EN TRAIN D'ÉCRIRE"
        // await client.sendPresenceUpdate('composing', remoteJid)
        
        await client.sendPresenceUpdate('available', remoteJid)
        
    } catch (error) {
        console.error('Autotype error:', error)
    }
}

export default { autorecord, autotype }
