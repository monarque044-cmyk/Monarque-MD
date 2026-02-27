/**
 * DigixNew - Extracteur de contenu universel pour Monarque MD
 * Permet d'extraire le message réel peu importe s'il est à vue unique ou normal.
 */
export const DigixNew = (message) => {
    // 1. Sécurité si le message est vide
    if (!message) return null;

    // 2. Extraction du contenu (Gère ViewOnce V1, V2 et les messages classiques)
    // WhatsApp 2026 utilise principalement viewOnceMessageV2
    const content = 
        message.viewOnceMessageV2?.message || 
        message.viewOnceMessage?.message || 
        message.ephemeralMessage?.message ||
        message;
    
    return content;
}

// Exportation par défaut et nommée pour plus de flexibilité
export default DigixNew;
