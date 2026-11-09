// Cartoon Caricature Style Avatars (High Resolution Vector SVGs)
// Custom styled for Player and all 10 unique Opponent Characters

export const AVATAR_CHARACTERS = {
  player: {
    id: 'player',
    name: 'Sen (Şampiyon)',
    title: 'Sapan Ustası',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="pSkin" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#ffdfba"/>
          <stop offset="100%" stop-color="#e8a87c"/>
        </radialGradient>
        <linearGradient id="pHair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2c3e50"/>
          <stop offset="100%" stop-color="#1a252f"/>
        </linearGradient>
        <linearGradient id="pHoodie" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#00d2d3"/>
          <stop offset="100%" stop-color="#01a3a4"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="#10ac84" stroke="#00ffc8" stroke-width="3"/>
      <!-- Body / Hoodie -->
      <path d="M 22 95 Q 50 78 78 95 L 85 100 L 15 100 Z" fill="url(#pHoodie)"/>
      <path d="M 42 85 L 50 96 L 58 85" stroke="#ffffff" stroke-width="2.5" fill="none"/>
      <!-- Head -->
      <ellipse cx="50" cy="52" rx="28" ry="30" fill="url(#pSkin)"/>
      <!-- Ears -->
      <ellipse cx="22" cy="53" rx="5" ry="7" fill="#e8a87c"/>
      <ellipse cx="78" cy="53" rx="5" ry="7" fill="#e8a87c"/>
      <!-- Hair / Cap -->
      <path d="M 22 46 Q 30 22 50 20 Q 70 22 78 46 Q 76 30 65 24 Q 48 20 35 25 Z" fill="url(#pHair)"/>
      <path d="M 22 38 Q 48 16 78 36 Q 84 37 88 43 Q 76 38 64 36 Q 44 32 22 38 Z" fill="#ff4757"/>
      <!-- Eyes & Brows -->
      <path d="M 32 44 Q 40 40 44 43" stroke="#2c3e50" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M 68 44 Q 60 40 56 43" stroke="#2c3e50" stroke-width="3" stroke-linecap="round" fill="none"/>
      <circle cx="39" cy="52" r="5" fill="#2c3e50"/>
      <circle cx="61" cy="52" r="5" fill="#2c3e50"/>
      <circle cx="41" cy="50" r="1.8" fill="#ffffff"/>
      <circle cx="63" cy="50" r="1.8" fill="#ffffff"/>
      <!-- Gamer Headset -->
      <path d="M 18 52 C 14 30 30 14 50 14 C 70 14 86 30 82 52" stroke="#2ed573" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <rect x="14" y="44" width="8" height="16" rx="4" fill="#2ed573"/>
      <rect x="78" y="44" width="8" height="16" rx="4" fill="#2ed573"/>
      <!-- Smirk Mouth -->
      <path d="M 40 68 Q 50 78 62 67" stroke="#2c3e50" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M 42 68 Q 50 75 60 67" fill="#ff6b81"/>
    </svg>`
  },

  opponent_1: {
    id: 'opponent_1',
    name: 'Çaylak Can',
    title: '1. Bölüm: Acemi Çırak',
    quote: 'Sapanı ters tutmuyorum değil mi?',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#ff9f43" stroke="#feca57" stroke-width="3"/>
      <!-- Body -->
      <path d="M 22 96 Q 50 82 78 96 L 85 100 L 15 100 Z" fill="#54a0ff"/>
      <!-- Head -->
      <ellipse cx="50" cy="53" rx="27" ry="29" fill="#ffdfba"/>
      <!-- Freckles -->
      <circle cx="36" cy="62" r="1.2" fill="#d35400"/>
      <circle cx="39" cy="64" r="1.2" fill="#d35400"/>
      <circle cx="64" cy="62" r="1.2" fill="#d35400"/>
      <circle cx="61" cy="64" r="1.2" fill="#d35400"/>
      <!-- Big Round Glasses -->
      <circle cx="38" cy="52" r="12" fill="rgba(255,255,255,0.3)" stroke="#222" stroke-width="2.5"/>
      <circle cx="62" cy="52" r="12" fill="rgba(255,255,255,0.3)" stroke="#222" stroke-width="2.5"/>
      <line x1="50" y1="52" x2="50" y2="52" stroke="#222" stroke-width="2.5"/>
      <circle cx="38" cy="52" r="4" fill="#2c3e50"/>
      <circle cx="62" cy="52" r="4" fill="#2c3e50"/>
      <circle cx="40" cy="50" r="1.5" fill="#fff"/>
      <circle cx="64" cy="50" r="1.5" fill="#fff"/>
      <!-- Orange Cap turned backwards -->
      <path d="M 24 44 Q 50 18 76 44 Q 85 40 88 46 Q 78 40 74 44 Z" fill="#ee5253"/>
      <!-- Funny confused grin -->
      <path d="M 42 70 Q 48 76 56 69" stroke="#222" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- Sweat drop -->
      <path d="M 74 34 Q 78 40 76 43 Q 73 45 71 43 Q 70 40 74 34 Z" fill="#48dbfb"/>
    </svg>`
  },

  opponent_2: {
    id: 'opponent_2',
    name: 'Buz Prensi Deniz',
    title: '2. Bölüm: Ateş & Buz',
    quote: 'Atışlarım sıfırın altında seyreder!',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#0abde3" stroke="#48dbfb" stroke-width="3"/>
      <!-- Body / Parka -->
      <path d="M 22 96 Q 50 80 78 96 L 85 100 L 15 100 Z" fill="#222f3e"/>
      <circle cx="50" cy="88" r="6" fill="#c8d6e5"/>
      <!-- Head -->
      <ellipse cx="50" cy="52" rx="27" ry="29" fill="#f8c291"/>
      <!-- Icy Spiky Hair -->
      <path d="M 24 45 L 30 25 L 38 32 L 46 16 L 54 30 L 64 20 L 72 32 L 78 45 Z" fill="#c8d6e5"/>
      <path d="M 30 25 L 42 18 L 50 25 L 62 16 L 70 30 Z" fill="#ffffff"/>
      <!-- Cool Ice Sunglasses -->
      <polygon points="26,48 48,46 46,59 30,59" fill="#00d2d3" stroke="#10ac84" stroke-width="1.5"/>
      <polygon points="54,46 74,48 70,59 52,59" fill="#00d2d3" stroke="#10ac84" stroke-width="1.5"/>
      <line x1="48" y1="48" x2="52" y2="48" stroke="#10ac84" stroke-width="2"/>
      <line x1="28" y1="52" x2="44" y2="54" stroke="#ffffff" stroke-width="1.5"/>
      <line x1="56" y1="54" x2="68" y2="52" stroke="#ffffff" stroke-width="1.5"/>
      <!-- Confident smirk -->
      <path d="M 44 72 Q 54 75 60 68" stroke="#222" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </svg>`
  },

  opponent_3: {
    id: 'opponent_3',
    name: 'Siber Samet',
    title: '3. Bölüm: Matrix & Siber Ağ',
    quote: 'Açıları ikili kodla hesaplarım.',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#1e272e" stroke="#10ac84" stroke-width="3"/>
      <!-- Hoodie -->
      <path d="M 20 96 Q 50 78 80 96 L 85 100 L 15 100 Z" fill="#000000"/>
      <!-- Head in shadow -->
      <ellipse cx="50" cy="52" rx="27" ry="29" fill="#d2b48c"/>
      <!-- Dark Hoodie Over Head -->
      <path d="M 22 55 Q 20 22 50 18 Q 80 22 78 55 Q 74 28 50 25 Q 26 28 22 55 Z" fill="#11141a"/>
      <!-- Glowing Cyber Visor -->
      <rect x="25" y="44" width="50" height="15" rx="4" fill="#000000" stroke="#00ff88" stroke-width="2"/>
      <path d="M 30 51 L 42 51 L 46 47 L 58 47 L 62 51 L 70 51" stroke="#00ff88" stroke-width="2" fill="none"/>
      <!-- Cyber Circuit on face -->
      <path d="M 34 68 L 38 68 L 42 74 L 46 74" stroke="#00ff88" stroke-width="1.5" fill="none"/>
      <!-- Stoic mouth -->
      <line x1="45" y1="71" x2="55" y2="71" stroke="#2c3e50" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  },

  opponent_4: {
    id: 'opponent_4',
    name: 'Astronot Ali',
    title: '4. Bölüm: Kozmik Galaksi',
    quote: 'Yerçekimsiz ortamda büyüdüm!',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#2c2c54" stroke="#f368e0" stroke-width="3"/>
      <!-- Spacesuit collar -->
      <path d="M 20 95 Q 50 80 80 95 L 85 100 L 15 100 Z" fill="#f1f2f6"/>
      <!-- Helmet Outer -->
      <circle cx="50" cy="50" r="34" fill="#f1f2f6" stroke="#dcdde1" stroke-width="3"/>
      <!-- Helmet Visor (Mirror Gold/Purple) -->
      <defs>
        <linearGradient id="astroVisor" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff9ff3"/>
          <stop offset="50%" stop-color="#feca57"/>
          <stop offset="100%" stop-color="#5f27cd"/>
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="50" rx="26" ry="24" fill="url(#astroVisor)"/>
      <!-- Visor glint reflection -->
      <path d="M 32 38 Q 48 30 64 36" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.8"/>
      <!-- Antenna with red blinking light -->
      <line x1="50" y1="16" x2="50" y2="6" stroke="#dcdde1" stroke-width="3"/>
      <circle cx="50" cy="6" r="4" fill="#ff4757"/>
    </svg>`
  },

  opponent_5: {
    id: 'opponent_5',
    name: 'Piksel Pamir',
    title: '5. Bölüm: Retro Arcade',
    quote: 'Jetonum bitene kadar buradayım!',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#5f27cd" stroke="#ff9f43" stroke-width="3"/>
      <!-- Body with Retro Bandana -->
      <path d="M 20 95 Q 50 80 80 95 L 85 100 L 15 100 Z" fill="#ff4757"/>
      <!-- Head -->
      <ellipse cx="50" cy="52" rx="27" ry="29" fill="#ffdfba"/>
      <!-- 8-Bit Pixel Shades -->
      <rect x="25" y="44" width="22" height="13" fill="#111"/>
      <rect x="53" y="44" width="22" height="13" fill="#111"/>
      <rect x="47" y="47" width="6" height="4" fill="#111"/>
      <!-- White pixel gleam -->
      <rect x="28" y="46" width="4" height="4" fill="#fff"/>
      <rect x="56" y="46" width="4" height="4" fill="#fff"/>
      <!-- Red 80s Headband -->
      <rect x="23" y="32" width="54" height="8" fill="#ff4757"/>
      <path d="M 75 34 L 86 42 L 80 46 Z" fill="#ff4757"/>
      <!-- Spiky anime hair -->
      <polygon points="25,32 35,16 42,32 50,14 60,32 70,18 75,32" fill="#2c3e50"/>
      <!-- Toothpick grin -->
      <path d="M 42 70 Q 50 78 58 70" stroke="#222" stroke-width="2.5" fill="none"/>
      <line x1="56" y1="70" x2="66" y2="66" stroke="#feca57" stroke-width="2"/>
    </svg>`
  },

  opponent_6: {
    id: 'opponent_6',
    name: 'Plazma Pelin',
    title: '6. Bölüm: Biyo-Tehlike & Plazma',
    quote: 'Fizik kurallarını yeniden yazalım mı?',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#10ac84" stroke="#00d2d3" stroke-width="3"/>
      <!-- Lab Coat -->
      <path d="M 20 95 Q 50 80 80 95 L 85 100 L 15 100 Z" fill="#f1f2f6"/>
      <path d="M 45 84 L 50 96 L 55 84" fill="#10ac84"/>
      <!-- Head -->
      <ellipse cx="50" cy="52" rx="26" ry="28" fill="#ffd1b3"/>
      <!-- Wild Purple Plasma Hair -->
      <path d="M 22 50 Q 14 26 34 20 Q 50 12 66 20 Q 86 26 78 50 Q 82 34 68 28 Q 50 24 30 30 Z" fill="#8854d0"/>
      <!-- High-tech Lab Goggles on Forehead -->
      <ellipse cx="40" cy="34" rx="9" ry="7" fill="#00ff88" stroke="#222" stroke-width="2"/>
      <ellipse cx="60" cy="34" rx="9" ry="7" fill="#00ff88" stroke="#222" stroke-width="2"/>
      <line x1="49" y1="34" x2="51" y2="34" stroke="#222" stroke-width="2"/>
      <!-- Eyes -->
      <circle cx="39" cy="52" r="5" fill="#8854d0"/>
      <circle cx="61" cy="52" r="5" fill="#8854d0"/>
      <circle cx="41" cy="50" r="1.8" fill="#ffffff"/>
      <circle cx="63" cy="50" r="1.8" fill="#ffffff"/>
      <!-- Witty confident smile -->
      <path d="M 42 68 Q 50 78 60 67" stroke="#2c3e50" stroke-width="2.8" stroke-linecap="round" fill="none"/>
    </svg>`
  },

  opponent_7: {
    id: 'opponent_7',
    name: 'Ejder Mert',
    title: '7. Bölüm: Ejder & Kaplan',
    quote: 'Gözün taşa değil, hedefe odaklansın!',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#b33939" stroke="#fbc531" stroke-width="3"/>
      <!-- Martial Gi -->
      <path d="M 20 95 Q 50 80 80 95 L 85 100 L 15 100 Z" fill="#2c2c54"/>
      <path d="M 38 82 L 50 96 L 62 82" stroke="#fbc531" stroke-width="3" fill="none"/>
      <!-- Head -->
      <ellipse cx="50" cy="52" rx="27" ry="29" fill="#f8c291"/>
      <!-- White Master Headband with Gold Dragon -->
      <rect x="23" y="34" width="54" height="9" fill="#ffffff"/>
      <circle cx="50" cy="38" r="3.5" fill="#e74c3c"/>
      <!-- Spiky Black Hair -->
      <polygon points="25,34 32,18 40,30 50,14 60,30 68,18 75,34" fill="#1e272e"/>
      <!-- Fierce Focused Eyes -->
      <polygon points="32,48 44,45 42,54" fill="#1e272e"/>
      <polygon points="68,48 56,45 58,54" fill="#1e272e"/>
      <circle cx="39" cy="50" r="2.2" fill="#e74c3c"/>
      <circle cx="61" cy="50" r="2.2" fill="#e74c3c"/>
      <!-- Serious mouth -->
      <line x1="43" y1="69" x2="57" y2="69" stroke="#1e272e" stroke-width="3" stroke-linecap="round"/>
    </svg>`
  },

  opponent_8: {
    id: 'opponent_8',
    name: 'Çarkçı Rüstem',
    title: '8. Bölüm: Steampunk & Çarklar',
    quote: 'Çarkların sesini duyuyor musun?',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#84593c" stroke="#f5cd79" stroke-width="3"/>
      <!-- Victorian Waistcoat -->
      <path d="M 20 95 Q 50 80 80 95 L 85 100 L 15 100 Z" fill="#301b0e"/>
      <path d="M 45 84 L 50 96 L 55 84" fill="#d6a05d"/>
      <!-- Head -->
      <ellipse cx="50" cy="53" rx="27" ry="28" fill="#e6b894"/>
      <!-- Steampunk Top Hat with Goggles -->
      <path d="M 26 36 L 32 12 L 68 12 L 74 36 Z" fill="#382215"/>
      <ellipse cx="50" cy="36" rx="30" ry="6" fill="#24140b"/>
      <!-- Brass Monocle on Right Eye -->
      <circle cx="62" cy="50" r="9" fill="rgba(245, 205, 121, 0.4)" stroke="#f5cd79" stroke-width="2.5"/>
      <line x1="71" y1="50" x2="80" y2="60" stroke="#f5cd79" stroke-width="1.5"/>
      <!-- Left Eye -->
      <circle cx="38" cy="50" r="4" fill="#2c3e50"/>
      <!-- Magnificent Curly Mustache -->
      <path d="M 50 64 Q 40 60 32 68 Q 28 66 30 62 Q 40 56 50 63 Q 60 56 70 62 Q 72 66 68 68 Q 60 60 50 64 Z" fill="#4b2e1e"/>
    </svg>`
  },

  opponent_9: {
    id: 'opponent_9',
    name: 'Fırtına Kemal',
    title: '9. Bölüm: Şimşek & Fırtına',
    quote: 'Şimşekten hızlı atamazsan şansın yok!',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#3c40c6" stroke="#00d8d6" stroke-width="3"/>
      <!-- Lightning Armor -->
      <path d="M 20 95 Q 50 80 80 95 L 85 100 L 15 100 Z" fill="#0fbcf9"/>
      <polygon points="50,80 46,89 54,89 48,98 56,88 50,88" fill="#ffd32a"/>
      <!-- Head -->
      <ellipse cx="50" cy="52" rx="27" ry="29" fill="#ffdd59"/>
      <!-- Electric Cyan Glowing Spikes -->
      <polygon points="20,44 14,26 28,34 34,14 44,28 50,8 58,26 68,12 74,32 86,22 80,44" fill="#00d8d6"/>
      <!-- Glowing Eyes -->
      <ellipse cx="38" cy="50" rx="6" ry="4" fill="#ffffff"/>
      <ellipse cx="62" cy="50" rx="6" ry="4" fill="#ffffff"/>
      <circle cx="38" cy="50" r="3" fill="#0be881"/>
      <circle cx="62" cy="50" r="3" fill="#0be881"/>
      <!-- Lightning Bolt on Cheek -->
      <polygon points="32,60 28,66 33,66 29,73 35,65 31,65" fill="#ffd32a"/>
      <!-- Fierce smirk -->
      <path d="M 43 72 Q 52 77 62 70" stroke="#1e272e" stroke-width="3" stroke-linecap="round" fill="none"/>
    </svg>`
  },

  opponent_10: {
    id: 'opponent_10',
    name: 'Büyük Usta Kerem',
    title: '10. Bölüm: Efsanevi Kozmik Şampiyon',
    quote: 'Buraya kadar geldin, ama tacımı vermem!',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="goldBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffd32a"/>
          <stop offset="100%" stop-color="#ff9f1a"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#goldBg)" stroke="#ffffff" stroke-width="3"/>
      <!-- Royal Velvet Cape -->
      <path d="M 18 95 Q 50 78 82 95 L 85 100 L 15 100 Z" fill="#575fcf"/>
      <circle cx="50" cy="85" r="7" fill="#ffd32a" stroke="#fff" stroke-width="2"/>
      <!-- Head -->
      <ellipse cx="50" cy="54" rx="27" ry="29" fill="#ffdfba"/>
      <!-- Golden Crown with Ruby Gems -->
      <polygon points="24,34 22,14 36,24 50,10 64,24 78,14 76,34" fill="#ffd32a" stroke="#d35400" stroke-width="1.5"/>
      <circle cx="50" cy="20" r="3" fill="#ff3838"/>
      <circle cx="32" cy="25" r="2.5" fill="#38ada9"/>
      <circle cx="68" cy="25" r="2.5" fill="#38ada9"/>
      <!-- Golden Sunglasses -->
      <polygon points="26,46 48,44 46,57 30,57" fill="#1e272e" stroke="#ffd32a" stroke-width="2"/>
      <polygon points="54,44 74,46 70,57 52,57" fill="#1e272e" stroke="#ffd32a" stroke-width="2"/>
      <line x1="48" y1="46" x2="52" y2="46" stroke="#ffd32a" stroke-width="2"/>
      <line x1="28" y1="50" x2="44" y2="52" stroke="#ffffff" stroke-width="1.5"/>
      <line x1="56" y1="52" x2="68" y2="50" stroke="#ffffff" stroke-width="1.5"/>
      <!-- Grand Master Smile -->
      <path d="M 40 70 Q 50 82 62 70" stroke="#1e272e" stroke-width="3" stroke-linecap="round" fill="none"/>
    </svg>`
  },

  multiplayer_guest: {
    id: 'multiplayer_guest',
    name: 'Online Rakip',
    title: 'Çevrimiçi Kapışma',
    quote: 'Meydan okumanı kabul ettim!',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#ff6b81" stroke="#ff4757" stroke-width="3"/>
      <!-- Body -->
      <path d="M 22 95 Q 50 78 78 95 L 85 100 L 15 100 Z" fill="#2f3542"/>
      <!-- Head -->
      <ellipse cx="50" cy="52" rx="27" ry="29" fill="#ffd1b3"/>
      <!-- Beanie -->
      <path d="M 22 45 Q 50 18 78 45 Q 76 34 50 30 Q 24 34 22 45 Z" fill="#ffa502"/>
      <rect x="22" y="42" width="56" height="7" rx="3" fill="#ff7f50"/>
      <!-- Cool Eyes -->
      <path d="M 32 46 Q 40 43 45 46" stroke="#2f3542" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <path d="M 68 46 Q 60 43 55 46" stroke="#2f3542" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <circle cx="39" cy="53" r="4.5" fill="#2f3542"/>
      <circle cx="61" cy="53" r="4.5" fill="#2f3542"/>
      <circle cx="41" cy="51" r="1.5" fill="#fff"/>
      <circle cx="63" cy="51" r="1.5" fill="#fff"/>
      <!-- Grin -->
      <path d="M 42 68 Q 50 76 60 67" stroke="#2f3542" stroke-width="2.8" stroke-linecap="round" fill="none"/>
    </svg>`
  }
};

// Convert SVG to data URI for use in <img> tags
export function getAvatarDataUri(avatarKey) {
  const char = AVATAR_CHARACTERS[avatarKey] || AVATAR_CHARACTERS.player;
  const encoded = encodeURIComponent(char.svg);
  return `data:image/svg+xml;utf8,${encoded}`;
}
