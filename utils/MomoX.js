import readline from 'readline';

export default async function deployAsPremium() {
    const key = "D07895461fdgdrq3ez8aaeqQ";

    // On crée l'interface une seule fois pour toute la session de questions
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    // Utilisation d'une fonction utilitaire pour poser des questions proprement
    const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

    try {
        const response = (await ask('🛡️ Avez-vous un mot de passe Admin Purchase ? (y/n) : ')).toLowerCase();

        if (response === 'y') {
            const password = await ask('🔑 Veuillez saisir le mot de passe : ');
            
            if (password === key) {
                console.log('✅ Accès Premium accordé !');
                rl.close();
                return true;
            } else {
                console.log('❌ Mot de passe incorrect.');
                rl.close();
                return false;
            }
        } else {
            console.log('⚠️ Connexion sans privilèges Admin.');
            rl.close();
            return false;
        }
    } catch (error) {
        console.error('❌ Erreur lors du déploiement :', error);
        rl.close();
        return false;
    }
}
