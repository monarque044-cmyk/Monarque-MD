import configmanager from "../utils/configmanager.js";

const number = 22780828646
configmanager.config.users[number] = {
    sudoList: ['22780828646@s.whatsapp.net'],
    tagAudioPath: "tag.mp3",
    antilink: false,
    response: true,
    autoreact: false,
    prefix: "&",
    reaction: "⚡",
    welcome: false,
    record:false,
    type:false,
    publicMode:false,
}
configmanager.save()

configmanager.premiums.premiumUser[`p`] = {
    premium: number,
} 
configmanager.saveP()