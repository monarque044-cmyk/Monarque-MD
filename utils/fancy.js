const monoFont = {
  a:"𝗮", b:"𝗯", c:"𝗰", d:"𝗱", e:"𝗲", f:"𝗳", g:"𝗴", h:"𝗵", i:"𝗶", j:"𝗷",
  k:"𝗸", l:"𝗹", m:"𝗺", n:"𝗻", o:"𝗼", p:"𝗽", q:"𝗾", r:"𝗿", s:"𝘀", t:"𝘁",
  u:"𝘂", v:"𝘃", w:"𝘄", x:"𝗅", y:"𝘆", z:"𝘇",
  A:"𝗔", B:"𝗕", C:"𝗖", D:"𝗗", E:"𝗘", F:"𝗙", G:"𝗚", H:"𝗛", I:"𝗜", J:"𝗝",
  K:"𝗞", L:"𝗟", M:"𝗠", N:"𝗡", O:"𝗢", P:"𝗣", Q:"𝗤", R:"𝗥", S:"𝗦", T:"𝗧",
  U:"𝗨", V:"𝗩", W:"𝗪", X:"𝗫", Y:"𝗬", Z:"𝗭"
};

/**
 * stylizedChar - Convertit le texte en police grasse sans empattement (Sans-Serif Bold)
 * Gère aussi bien les chaînes simples que les objets { text: "..." }
 */
export default function stylizedChar(input) {
  // 1. Sécurité : Si l'input est un objet (comme dans ton fichier viewonce.js), on extrait .text
  const text = (typeof input === 'object' && input !== null) ? (input.text || "") : (input || "");

  // 2. Conversion caractère par caractère
  return [...String(text)].map(c => monoFont[c] || c).join("");
}
