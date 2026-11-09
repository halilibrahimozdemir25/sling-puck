// Level Themes, Arena Visual Styles, and Puck Designs
// 10 Unique Football Pitch Themes, Ball Designs, and Speed Trails for Campaign Levels 1-10 + Multiplayer

import { AVATAR_CHARACTERS } from './avatars.js';

export const LEVEL_THEMES = [
  // =========================================================================
  // BÖLÜM 1: KLASİK ZÜMRÜT STADYUM (ÇAYLAK CAN)
  // =========================================================================
  {
    level: 1,
    id: 'emerald_stadium',
    name: 'Klasik Zümrüt Stadyum',
    arenaTitle: 'EMERALD ARENA',
    opponent: AVATAR_CHARACTERS.opponent_1,
    pitch: {
      turfBase: '#13461b',
      turfLight: 'rgba(28, 92, 38, 0.95)',
      turfDark: 'rgba(18, 65, 25, 0.95)',
      mowPattern: 'horizontal', // horizontal stripes
      stripeCount: 12,
      lineColor: 'rgba(255, 255, 255, 0.90)',
      floodlightGlow: 'rgba(255, 255, 255, 0.16)',
      bgTop: '#06170d',
      bgBottom: '#010503',
      barrierText: ['⚽ SLING PUCK ⚽', '★ ÇAYLAK DERBİSİ ★'],
      barrierAccent: '#2ecc71',
      barrierGrad: ['#2c3e50', '#1a252f', '#0d1318'],
      frameColor: '#2ecc71',
    },
    playerBall: {
      name: 'Klasik Telstar Beyaz',
      baseGrad: ['#ffffff', '#f8fafc', '#e2e8f0', '#94a3b8'],
      pentagonColor: '#1e293b',
      seamColor: 'rgba(71, 85, 105, 0.55)',
      rimColor: '#00ffc8',
      specular: 'rgba(255, 255, 255, 0.85)',
    },
    opponentBall: {
      name: 'Şampiyonlar Kırmızı',
      baseGrad: ['#2d3748', '#1a202c', '#0f172a', '#020617'],
      pentagonColor: '#e74c3c',
      seamColor: 'rgba(255, 107, 107, 0.55)',
      rimColor: '#f1c40f',
      specular: 'rgba(255, 255, 255, 0.75)',
    },
    playerTrail: {
      ribbonColor: '#00ffc8',
      sparkColor: '#2ecc71',
      coreColor: '#ffffff',
    },
    opponentTrail: {
      ribbonColor: '#ff4757',
      sparkColor: '#ffa502',
      coreColor: '#ffffff',
    },
  },

  // =========================================================================
  // BÖLÜM 2: ATEŞ & LAV SAHASI (HIZLI HAKAN)
  // =========================================================================
  {
    level: 2,
    id: 'magma_pitch',
    name: 'Ateş & Lav Sahası',
    arenaTitle: 'VOLCANO TURF',
    opponent: AVATAR_CHARACTERS.opponent_2,
    pitch: {
      turfBase: '#38160c',
      turfLight: 'rgba(84, 32, 16, 0.95)',
      turfDark: 'rgba(56, 20, 10, 0.95)',
      mowPattern: 'checker', // Checkerboard turf mowing
      stripeCount: 10,
      lineColor: 'rgba(255, 195, 18, 0.92)', // Golden amber chalk
      floodlightGlow: 'rgba(255, 159, 67, 0.18)',
      bgTop: '#240a05',
      bgBottom: '#0d0301',
      barrierText: ['🔥 VOLKAN DERBİSİ 🔥', '★ ATEŞ & LAV ★'],
      barrierAccent: '#ff9f43',
      barrierGrad: ['#4a150d', '#2c0c07', '#150503'],
      frameColor: '#ff9f43',
    },
    playerBall: {
      name: 'Güneş Alevi Topu',
      baseGrad: ['#fff7ed', '#ffedd5', '#fed7aa', '#ea580c'],
      pentagonColor: '#c2410c',
      seamColor: 'rgba(234, 88, 12, 0.60)',
      rimColor: '#f59e0b',
      specular: 'rgba(255, 255, 255, 0.90)',
    },
    opponentBall: {
      name: 'Obsidyen Magma Topu',
      baseGrad: ['#3f1d18', '#230e0b', '#170805', '#0a0201'],
      pentagonColor: '#ef4444',
      seamColor: 'rgba(239, 68, 68, 0.60)',
      rimColor: '#dc2626',
      specular: 'rgba(255, 200, 180, 0.75)',
    },
    playerTrail: {
      ribbonColor: '#f59e0b',
      sparkColor: '#fbbf24',
      coreColor: '#fffbeb',
    },
    opponentTrail: {
      ribbonColor: '#ef4444',
      sparkColor: '#f97316',
      coreColor: '#ffffff',
    },
  },

  // =========================================================================
  // BÖLÜM 3: SİBER KOD MATRİSİ (USTA KEREM)
  // =========================================================================
  {
    level: 3,
    id: 'cyber_matrix',
    name: 'Siber Matris Sahası',
    arenaTitle: 'MATRIX COLISEUM',
    opponent: AVATAR_CHARACTERS.opponent_3,
    pitch: {
      turfBase: '#062919',
      turfLight: 'rgba(10, 58, 35, 0.95)',
      turfDark: 'rgba(5, 36, 21, 0.95)',
      mowPattern: 'vertical', // Vertical roller mowing
      stripeCount: 8,
      lineColor: 'rgba(46, 213, 115, 0.95)', // Neon lime chalk lines
      floodlightGlow: 'rgba(46, 213, 115, 0.20)',
      bgTop: '#031a0f',
      bgBottom: '#010a05',
      barrierText: ['⚡ SİBER LİG ⚡', '★ MATRIX KUPA ★'],
      barrierAccent: '#1dd1a1',
      barrierGrad: ['#0e3d28', '#072418', '#03140c'],
      frameColor: '#1dd1a1',
    },
    playerBall: {
      name: 'Siber Matris Topu',
      baseGrad: ['#f0fdf4', '#dcfce7', '#bbf7d0', '#22c55e'],
      pentagonColor: '#15803d',
      seamColor: 'rgba(21, 128, 61, 0.60)',
      rimColor: '#10b981',
      specular: 'rgba(255, 255, 255, 0.90)',
    },
    opponentBall: {
      name: 'Karanlık Kod Topu',
      baseGrad: ['#1e1b4b', '#0f172a', '#020617', '#000000'],
      pentagonColor: '#8b5cf6',
      seamColor: 'rgba(139, 92, 246, 0.60)',
      rimColor: '#a855f7',
      specular: 'rgba(255, 255, 255, 0.75)',
    },
    playerTrail: {
      ribbonColor: '#10b981',
      sparkColor: '#4ade80',
      coreColor: '#ffffff',
    },
    opponentTrail: {
      ribbonColor: '#a855f7',
      sparkColor: '#c084fc',
      coreColor: '#ffffff',
    },
  },

  // =========================================================================
  // BÖLÜM 4: BUZUL & KUTUP ARENASI (ÇELİK BURAK)
  // =========================================================================
  {
    level: 4,
    id: 'arctic_frost',
    name: 'Kutup & Buzul Sahası',
    arenaTitle: 'ARCTIC GLACIER',
    opponent: AVATAR_CHARACTERS.opponent_4,
    pitch: {
      turfBase: '#103940',
      turfLight: 'rgba(22, 75, 84, 0.95)',
      turfDark: 'rgba(14, 52, 59, 0.95)',
      mowPattern: 'horizontal',
      stripeCount: 12,
      lineColor: 'rgba(224, 247, 250, 0.95)', // Ice white frost lines
      floodlightGlow: 'rgba(129, 236, 236, 0.20)',
      bgTop: '#082024',
      bgBottom: '#020b0d',
      barrierText: ['❄️ KUTUP KUPASI ❄️', '★ BUZ DERBİSİ ★'],
      barrierAccent: '#00d2d3',
      barrierGrad: ['#174852', '#0c2e36', '#05181c'],
      frameColor: '#00d2d3',
    },
    playerBall: {
      name: 'Buz Kristali Maç Topu',
      baseGrad: ['#ffffff', '#f0fdfa', '#ccfbf1', '#5eead4'],
      pentagonColor: '#0f766e',
      seamColor: 'rgba(15, 118, 110, 0.60)',
      rimColor: '#06b6d4',
      specular: 'rgba(255, 255, 255, 0.95)',
    },
    opponentBall: {
      name: 'Karanlık Fırtına Topu',
      baseGrad: ['#1e293b', '#0f172a', '#08101e', '#020617'],
      pentagonColor: '#38bdf8',
      seamColor: 'rgba(56, 189, 248, 0.60)',
      rimColor: '#0284c7',
      specular: 'rgba(255, 255, 255, 0.80)',
    },
    playerTrail: {
      ribbonColor: '#06b6d4',
      sparkColor: '#67e8f9',
      coreColor: '#ffffff',
    },
    opponentTrail: {
      ribbonColor: '#0284c7',
      sparkColor: '#38bdf8',
      coreColor: '#ffffff',
    },
  },

  // =========================================================================
  // BÖLÜM 5: RETRO ALTIN ARCADE (FIRTINA SELİM)
  // =========================================================================
  {
    level: 5,
    id: 'golden_arcade',
    name: 'Retro Altın Arcade',
    arenaTitle: 'PIXEL STADIUM',
    opponent: AVATAR_CHARACTERS.opponent_5,
    pitch: {
      turfBase: '#2e2508',
      turfLight: 'rgba(64, 52, 13, 0.95)',
      turfDark: 'rgba(42, 34, 8, 0.95)',
      mowPattern: 'checker',
      stripeCount: 10,
      lineColor: 'rgba(254, 202, 87, 0.95)', // Golden arcade lines
      floodlightGlow: 'rgba(254, 202, 87, 0.20)',
      bgTop: '#1f1804',
      bgBottom: '#0a0801',
      barrierText: ['🪙 RETRO CUP 🪙', '★ 8-BIT ARENA ★'],
      barrierAccent: '#feca57',
      barrierGrad: ['#42340a', '#291f04', '#140f02'],
      frameColor: '#feca57',
    },
    playerBall: {
      name: 'Altın Sikke Topu',
      baseGrad: ['#fefce8', '#fef08a', '#fde047', '#eab308'],
      pentagonColor: '#854d0e',
      seamColor: 'rgba(133, 77, 14, 0.60)',
      rimColor: '#facc15',
      specular: 'rgba(255, 255, 255, 0.90)',
    },
    opponentBall: {
      name: 'Piksel Bomba Topu',
      baseGrad: ['#292524', '#1c1917', '#0c0a09', '#000000'],
      pentagonColor: '#ef4444',
      seamColor: 'rgba(239, 68, 68, 0.60)',
      rimColor: '#f87171',
      specular: 'rgba(255, 255, 255, 0.75)',
    },
    playerTrail: {
      ribbonColor: '#eab308',
      sparkColor: '#fde047',
      coreColor: '#ffffff',
    },
    opponentTrail: {
      ribbonColor: '#ef4444',
      sparkColor: '#f87171',
      coreColor: '#ffffff',
    },
  },

  // =========================================================================
  // BÖLÜM 6: ŞAMPİYONLAR GECESİ (USTA DEMİR)
  // =========================================================================
  {
    level: 6,
    id: 'champions_night',
    name: 'Şampiyonlar Gecesi',
    arenaTitle: 'STARLIGHT ARENA',
    opponent: AVATAR_CHARACTERS.opponent_6,
    pitch: {
      turfBase: '#0c2438',
      turfLight: 'rgba(18, 52, 79, 0.95)',
      turfDark: 'rgba(10, 32, 51, 0.95)',
      mowPattern: 'horizontal',
      stripeCount: 12,
      lineColor: 'rgba(241, 245, 249, 0.95)', // Brilliant starlight white
      floodlightGlow: 'rgba(56, 189, 248, 0.20)',
      bgTop: '#061726',
      bgBottom: '#02080d',
      barrierText: ['⭐ ŞAMPİYONLAR GECESİ ⭐', '★ STARLIGHT CUP ★'],
      barrierAccent: '#38bdf8',
      barrierGrad: ['#123450', '#0a1f30', '#040d14'],
      frameColor: '#38bdf8',
    },
    playerBall: {
      name: 'Yıldızlar Ligi Beyaz',
      baseGrad: ['#ffffff', '#f1f5f9', '#cbd5e1', '#64748b'],
      pentagonColor: '#0284c7',
      seamColor: 'rgba(2, 132, 199, 0.60)',
      rimColor: '#38bdf8',
      specular: 'rgba(255, 255, 255, 0.95)',
    },
    opponentBall: {
      name: 'Kırmızı Süperyıldız',
      baseGrad: ['#3b0716', '#21040c', '#120206', '#050002'],
      pentagonColor: '#f43f5e',
      seamColor: 'rgba(244, 63, 94, 0.60)',
      rimColor: '#fb7185',
      specular: 'rgba(255, 255, 255, 0.80)',
    },
    playerTrail: {
      ribbonColor: '#38bdf8',
      sparkColor: '#7dd3fc',
      coreColor: '#ffffff',
    },
    opponentTrail: {
      ribbonColor: '#f43f5e',
      sparkColor: '#fb7185',
      coreColor: '#ffffff',
    },
  },

  // =========================================================================
  // BÖLÜM 7: KIZIL EJDER ARENASI (ŞAMPİYON EFE)
  // =========================================================================
  {
    level: 7,
    id: 'dragon_shrine',
    name: 'Kızıl Ejder Sahası',
    arenaTitle: 'DRAGON ARENA',
    opponent: AVATAR_CHARACTERS.opponent_7,
    pitch: {
      turfBase: '#0e3b23',
      turfLight: 'rgba(20, 82, 49, 0.95)',
      turfDark: 'rgba(12, 54, 32, 0.95)',
      mowPattern: 'vertical',
      stripeCount: 8,
      lineColor: 'rgba(240, 253, 244, 0.92)',
      floodlightGlow: 'rgba(46, 213, 115, 0.18)',
      bgTop: '#082415',
      bgBottom: '#020d07',
      barrierText: ['🐉 EJDER LİGİ 🐉', '★ DRAGON CUP ★'],
      barrierAccent: '#2ed573',
      barrierGrad: ['#154d2f', '#0d331f', '#05170e'],
      frameColor: '#2ed573',
    },
    playerBall: {
      name: 'Yeşim Ejder Topu',
      baseGrad: ['#f0fdf4', '#dcfce7', '#86efac', '#16a34a'],
      pentagonColor: '#14532d',
      seamColor: 'rgba(20, 83, 45, 0.60)',
      rimColor: '#4ade80',
      specular: 'rgba(255, 255, 255, 0.90)',
    },
    opponentBall: {
      name: 'Yakut Kaplan Topu',
      baseGrad: ['#450a0a', '#290606', '#170303', '#000000'],
      pentagonColor: '#ea580c',
      seamColor: 'rgba(234, 88, 12, 0.60)',
      rimColor: '#f97316',
      specular: 'rgba(255, 220, 180, 0.75)',
    },
    playerTrail: {
      ribbonColor: '#22c55e',
      sparkColor: '#86efac',
      coreColor: '#ffffff',
    },
    opponentTrail: {
      ribbonColor: '#ea580c',
      sparkColor: '#fb923c',
      coreColor: '#ffffff',
    },
  },

  // =========================================================================
  // BÖLÜM 8: BUHAR & ÇARKLAR (BÜYÜK REİS)
  // =========================================================================
  {
    level: 8,
    id: 'steampunk_pitch',
    name: 'Buhar & Çarklar Sahası',
    arenaTitle: 'CLOCKWORK STADIUM',
    opponent: AVATAR_CHARACTERS.opponent_8,
    pitch: {
      turfBase: '#2a2212',
      turfLight: 'rgba(64, 52, 28, 0.95)',
      turfDark: 'rgba(40, 32, 17, 0.95)',
      mowPattern: 'checker',
      stripeCount: 10,
      lineColor: 'rgba(234, 179, 8, 0.92)', // Antique brass chalk
      floodlightGlow: 'rgba(234, 179, 8, 0.18)',
      bgTop: '#1c160a',
      bgBottom: '#0a0803',
      barrierText: ['⚙️ ÇARKLAR DERBİSİ ⚙️', '★ STEAM LEAGUE ★'],
      barrierAccent: '#eab308',
      barrierGrad: ['#3b2f15', '#241c0a', '#100c04'],
      frameColor: '#eab308',
    },
    playerBall: {
      name: 'Pirinç Çark Topu',
      baseGrad: ['#fefce8', '#fef08a', '#facc15', '#ca8a04'],
      pentagonColor: '#713f12',
      seamColor: 'rgba(113, 63, 18, 0.60)',
      rimColor: '#eab308',
      specular: 'rgba(255, 255, 255, 0.85)',
    },
    opponentBall: {
      name: 'Koyu Titanyum Zırh',
      baseGrad: ['#334155', '#1e293b', '#0f172a', '#020617'],
      pentagonColor: '#94a3b8',
      seamColor: 'rgba(148, 163, 184, 0.60)',
      rimColor: '#cbd5e1',
      specular: 'rgba(255, 255, 255, 0.80)',
    },
    playerTrail: {
      ribbonColor: '#ca8a04',
      sparkColor: '#fde047',
      coreColor: '#ffffff',
    },
    opponentTrail: {
      ribbonColor: '#94a3b8',
      sparkColor: '#e2e8f0',
      coreColor: '#ffffff',
    },
  },

  // =========================================================================
  // BÖLÜM 9: FIRTINA TEPESİ (EFSANE METİN)
  // =========================================================================
  {
    level: 9,
    id: 'thunder_tempest',
    name: 'Fırtına Tepesi',
    arenaTitle: 'THUNDER DOME',
    opponent: AVATAR_CHARACTERS.opponent_9,
    pitch: {
      turfBase: '#0c2238',
      turfLight: 'rgba(18, 52, 84, 0.95)',
      turfDark: 'rgba(10, 32, 54, 0.95)',
      mowPattern: 'horizontal',
      stripeCount: 12,
      lineColor: 'rgba(250, 204, 21, 0.95)', // Lightning Yellow chalk
      floodlightGlow: 'rgba(250, 204, 21, 0.22)',
      bgTop: '#081726',
      bgBottom: '#02070d',
      barrierText: ['⚡ FIRTINA DERBİSİ ⚡', '★ THUNDER CUP ★'],
      barrierAccent: '#facc15',
      barrierGrad: ['#15395c', '#0c2338', '#050f1a'],
      frameColor: '#facc15',
    },
    playerBall: {
      name: 'Şimşek Küresi Beyaz',
      baseGrad: ['#ffffff', '#f8fafc', '#e0f2fe', '#38bdf8'],
      pentagonColor: '#0284c7',
      seamColor: 'rgba(2, 132, 199, 0.60)',
      rimColor: '#facc15',
      specular: 'rgba(255, 255, 255, 0.95)',
    },
    opponentBall: {
      name: 'Karanlık Girdap Moru',
      baseGrad: ['#2e1065', '#1e1b4b', '#0f172a', '#020617'],
      pentagonColor: '#c084fc',
      seamColor: 'rgba(192, 132, 252, 0.60)',
      rimColor: '#a855f7',
      specular: 'rgba(255, 255, 255, 0.80)',
    },
    playerTrail: {
      ribbonColor: '#38bdf8',
      sparkColor: '#facc15',
      coreColor: '#ffffff',
    },
    opponentTrail: {
      ribbonColor: '#a855f7',
      sparkColor: '#c084fc',
      coreColor: '#ffffff',
    },
  },

  // =========================================================================
  // BÖLÜM 10: DÜNYA KUPASI BÜYÜK FİNALİ (DÜNYA ŞAMPİYONU ALEX)
  // =========================================================================
  {
    level: 10,
    id: 'grand_final',
    name: 'Dünya Kupası Büyük Finali',
    arenaTitle: 'GRAND WORLD CUP FINAL',
    opponent: AVATAR_CHARACTERS.opponent_10,
    pitch: {
      turfBase: '#0e3820',
      turfLight: 'rgba(20, 85, 48, 0.98)',
      turfDark: 'rgba(12, 54, 30, 0.98)',
      mowPattern: 'checker', // Diamond / checker grand final lawn
      stripeCount: 12,
      lineColor: 'rgba(254, 240, 138, 0.98)', // 24K Pure Gold Pitch Markings!
      floodlightGlow: 'rgba(250, 204, 21, 0.25)',
      bgTop: '#082414',
      bgBottom: '#020a05',
      barrierText: ['🏆 DÜNYA KUPASI BÜYÜK FİNALİ 🏆', '★ WORLD CHAMPION ★'],
      barrierAccent: '#ffd700',
      barrierGrad: ['#42320a', '#261c04', '#100b01'],
      frameColor: '#ffd700',
    },
    playerBall: {
      name: 'Altın Şampiyonluk Topu',
      baseGrad: ['#ffffff', '#fef08a', '#facc15', '#eab308'],
      pentagonColor: '#854d0e',
      seamColor: 'rgba(133, 77, 14, 0.65)',
      rimColor: '#ffd700',
      specular: 'rgba(255, 255, 255, 0.95)',
    },
    opponentBall: {
      name: 'Platin Şampiyonluk Topu',
      baseGrad: ['#1e293b', '#0f172a', '#020617', '#000000'],
      pentagonColor: '#dc2626',
      seamColor: 'rgba(220, 38, 38, 0.65)',
      rimColor: '#ffd700',
      specular: 'rgba(255, 255, 255, 0.85)',
    },
    playerTrail: {
      ribbonColor: '#facc15',
      sparkColor: '#ffd700',
      coreColor: '#ffffff',
    },
    opponentTrail: {
      ribbonColor: '#ef4444',
      sparkColor: '#ffd700',
      coreColor: '#ffffff',
    },
  },
];

export function getThemeForLevel(levelNumber) {
  const index = Math.max(0, Math.min(LEVEL_THEMES.length - 1, (levelNumber || 1) - 1));
  return LEVEL_THEMES[index];
}
