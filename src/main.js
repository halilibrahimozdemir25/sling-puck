import { SlingPuckGame } from './game.js';
import { LEVEL_CONFIGS } from './ai.js';
import { soundManager } from './audio.js';
import { AVATAR_CHARACTERS, getAvatarDataUri } from './avatars.js';
import { MultiplayerClient } from './multiplayer.js';

// DOM Elements: Canvas & Scoreboard Top HUD
const canvas = document.getElementById('game-canvas');
const hudPlayerAvatar = document.getElementById('hud-player-avatar');
const hudOpponentAvatar = document.getElementById('hud-opponent-avatar');
const hudPlayerName = document.getElementById('hud-player-name');
const hudOpponentName = document.getElementById('hud-opponent-name');
const hudPlayerSub = document.getElementById('hud-player-sub');
const hudOpponentSub = document.getElementById('hud-opponent-sub');
const btnHudPlay = document.getElementById('btn-hud-play');
const playerStoneChips = document.getElementById('player-stone-chips');
const opponentStoneChips = document.getElementById('opponent-stone-chips');
const hudMatchBadge = document.getElementById('hud-match-badge');
const playerPuckCountEl = document.getElementById('player-puck-count');
const aiPuckCountEl = document.getElementById('ai-puck-count');
const hudTurnTimer = document.getElementById('hud-turn-timer');

// Quick HUD Actions
const btnSoundToggle = document.getElementById('btn-sound-toggle');
const btnOpenMenu = document.getElementById('btn-open-menu');

// Turn Indicator Banner
const turnBanner = document.getElementById('turn-banner');
const turnText = document.getElementById('turn-text');

// Modals
const modalMenu = document.getElementById('modal-menu');
const modalMultiplayer = document.getElementById('modal-multiplayer');
const modalMatchmaking = document.getElementById('modal-matchmaking');
const modalLevels = document.getElementById('modal-levels');
const modalWin = document.getElementById('modal-win');
const modalLose = document.getElementById('modal-lose');
const modalDisconnect = document.getElementById('modal-disconnect');
const modalTutorial = document.getElementById('modal-tutorial');
const levelGrid = document.getElementById('level-grid');

// Menu Buttons
const btnPlayOnlineMain = document.getElementById('btn-play-online-main');
const btnOpenMultiplayer = document.getElementById('btn-open-multiplayer');
const btnResumeGame = document.getElementById('btn-resume-game');
const btnSelectLevels = document.getElementById('btn-select-levels');
const btnCloseLevels = document.getElementById('btn-close-levels');
const btnModePvp = document.getElementById('btn-mode-pvp');
const btnHowToPlay = document.getElementById('btn-how-to-play');
const btnCloseTutorial = document.getElementById('btn-close-tutorial');
const btnNextLevel = document.getElementById('btn-next-level');
const btnReplayLevel = document.getElementById('btn-replay-level');
const btnRetryLose = document.getElementById('btn-retry-lose');
const btnMenuFromLose = document.getElementById('btn-menu-from-lose');
const btnDisconnectMenu = document.getElementById('btn-disconnect-menu');

// Matchmaking Modal Elements
const matchmakingTitle = document.getElementById('matchmaking-title');
const matchmakingSubtitle = document.getElementById('matchmaking-subtitle');
const matchmakingTimerEl = document.getElementById('matchmaking-timer');
const matchPlayerName = document.getElementById('match-player-name');
const matchPlayerStats = document.getElementById('match-player-stats');
const matchPlayerAvatar = document.getElementById('match-player-avatar');
const matchOpponentName = document.getElementById('match-opponent-name');
const matchOpponentStats = document.getElementById('match-opponent-stats');
const matchOpponentAvatar = document.getElementById('match-opponent-avatar');
const matchOpponentRing = document.getElementById('match-opponent-ring');
const btnCancelMatchmaking = document.getElementById('btn-cancel-matchmaking');

// Win / Loss Trophy elements
const winTrophyBox = document.getElementById('win-trophy-box');
const winTrophyGain = document.getElementById('win-trophy-gain');
const winTrophyTotal = document.getElementById('win-trophy-total');
const btnNextOnlineMatch = document.getElementById('btn-next-online-match');
const btnMenuFromWin = document.getElementById('btn-menu-from-win');

const loseTrophyBox = document.getElementById('lose-trophy-box');
const loseTrophyGain = document.getElementById('lose-trophy-gain');
const loseTrophyTotal = document.getElementById('lose-trophy-total');
const btnRetryOnlineMatch = document.getElementById('btn-retry-online-match');

// Online Multiplayer Elements
const onlineNicknameInput = document.getElementById('online-nickname');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
const btnCreateRoom = document.getElementById('btn-create-room');
const panelRoomCreated = document.getElementById('panel-room-created');
const createdRoomCode = document.getElementById('created-room-code');
const btnCopyCode = document.getElementById('btn-copy-code');
const inputRoomCode = document.getElementById('input-room-code');
const btnJoinRoom = document.getElementById('btn-join-room');
const joinStatusMsg = document.getElementById('join-status-msg');
const btnQuickMatch = document.getElementById('btn-quick-match');
const quickMatchWaiting = document.getElementById('quick-match-waiting');
const btnCloseMultiplayer = document.getElementById('btn-close-multiplayer');

// Player Profile & Progression (Levels 1-10, Trophies, Wins/Losses)
class PlayerProfile {
  constructor() {
    this.name = localStorage.getItem('sling_puck_nickname') || 'Sen';
    this.level = parseInt(localStorage.getItem('sling_puck_player_level') || '1', 10);
    this.trophies = parseInt(localStorage.getItem('sling_puck_trophies') || '100', 10);
    this.wins = parseInt(localStorage.getItem('sling_puck_wins') || '0', 10);
    this.losses = parseInt(localStorage.getItem('sling_puck_losses') || '0', 10);
  }

  save() {
    localStorage.setItem('sling_puck_nickname', this.name);
    localStorage.setItem('sling_puck_player_level', this.level.toString());
    localStorage.setItem('sling_puck_trophies', this.trophies.toString());
    localStorage.setItem('sling_puck_wins', this.wins.toString());
    localStorage.setItem('sling_puck_losses', this.losses.toString());
  }

  addWin(trophies = 30) {
    this.wins++;
    this.trophies += trophies;
    const calcLvl = Math.min(10, Math.max(1, 1 + Math.floor(this.trophies / 100)));
    this.level = Math.max(this.level, calcLvl);
    this.save();
    return { trophiesGained: trophies };
  }

  addLoss(trophies = 10) {
    this.losses++;
    this.trophies = Math.max(0, this.trophies - trophies);
    this.save();
    return { trophiesLost: trophies };
  }
}

const playerProfile = new PlayerProfile();
if (onlineNicknameInput) {
  onlineNicknameInput.value = playerProfile.name;
  onlineNicknameInput.addEventListener('input', (e) => {
    playerProfile.name = e.target.value.trim() || 'Sen';
    playerProfile.save();
  });
}

function updateHudProfileSubtitles(opponent = null) {
  if (hudPlayerSub) {
    hudPlayerSub.textContent = `Sv. ${playerProfile.level} • 🏆 ${playerProfile.trophies}`;
  }
  if (hudOpponentSub) {
    if (opponent) {
      const oppLevel = opponent.level || 1;
      const oppTrophies = opponent.trophies || (oppLevel * 100);
      hudOpponentSub.textContent = `Sv. ${oppLevel} • 🏆 ${oppTrophies}`;
    } else if (game && game.mode === 'campaign') {
      const cfg = LEVEL_CONFIGS[game.currentLevel - 1] || LEVEL_CONFIGS[0];
      hudOpponentSub.textContent = `${cfg.badge} • Sv. ${game.currentLevel}`;
    } else {
      hudOpponentSub.textContent = 'Oyuncu 2';
    }
  }
}

// Floating Reaction Emoji Bar
const emojiBar = document.getElementById('emoji-bar');
const emojiPopupLayer = document.getElementById('emoji-popup-layer');

// Victory / Defeat info labels
const winDesc = document.getElementById('win-desc');
const winStars = document.getElementById('win-stars');
const winTurns = document.getElementById('win-turns');
const loseDesc = document.getElementById('lose-desc');

// Helper to hide all modals
function hideAllModals() {
  [
    modalMenu,
    modalMultiplayer,
    modalMatchmaking,
    modalLevels,
    modalWin,
    modalLose,
    modalDisconnect,
    modalTutorial,
  ].forEach((m) => m && m.classList.add('hidden'));
}

// Matchmaking state & timer
let matchmakingInterval = null;
let matchmakingSeconds = 0;

function startMatchmakingSearch() {
  soundManager.playClick();
  hideAllModals();

  const nickname = (onlineNicknameInput?.value.trim() || playerProfile.name || 'Sen');
  playerProfile.name = nickname;
  playerProfile.save();

  matchmakingSeconds = 0;
  if (matchmakingTitle) matchmakingTitle.textContent = 'RAKİP ARANIYOR...';
  if (matchmakingSubtitle) matchmakingSubtitle.textContent = 'Seviyene uygun bir çevrimiçi rakip aranıyor';
  if (matchmakingTimerEl) matchmakingTimerEl.textContent = 'Arama Süresi: 00:00';

  if (matchPlayerName) matchPlayerName.textContent = nickname;
  if (matchPlayerStats) matchPlayerStats.textContent = `Sv. ${playerProfile.level} • 🏆 ${playerProfile.trophies}`;
  if (matchPlayerAvatar) matchPlayerAvatar.src = getAvatarDataUri('player');

  if (matchOpponentName) matchOpponentName.textContent = 'Aranıyor...';
  if (matchOpponentStats) matchOpponentStats.textContent = 'Seviye ? • 🏆 ?';
  if (matchOpponentAvatar) matchOpponentAvatar.src = getAvatarDataUri('opponent_1');
  if (matchOpponentRing) matchOpponentRing.classList.add('searching-pulse');

  modalMatchmaking.classList.remove('hidden');

  if (matchmakingInterval) clearInterval(matchmakingInterval);
  matchmakingInterval = setInterval(() => {
    matchmakingSeconds++;
    const s = matchmakingSeconds < 10 ? `0${matchmakingSeconds}` : matchmakingSeconds;
    if (matchmakingTimerEl) matchmakingTimerEl.textContent = `Arama Süresi: 00:${s}`;

    // Cycle avatars slightly during search for realistic liveliness
    const randomAvatarIdx = 1 + (matchmakingSeconds % 10);
    if (matchOpponentAvatar) matchOpponentAvatar.src = getAvatarDataUri(`opponent_${randomAvatarIdx}`);
  }, 1000);

  // Send QUICK_MATCH to server with player's actual level and trophies
  multiplayerClient.quickMatch(nickname, 'player', playerProfile.level, playerProfile.trophies);
}

function cancelMatchmakingSearch() {
  soundManager.playClick();
  if (matchmakingInterval) {
    clearInterval(matchmakingInterval);
    matchmakingInterval = null;
  }
  multiplayerClient.cancelQuickMatch();
  modalMatchmaking.classList.add('hidden');
  modalMenu.classList.remove('hidden');
}

function revealOpponentAndStartMatch({ roomCode, myRole = 'host', opponent, level = 1, firstTurn = 'player', isSimulated = false }) {
  if (matchmakingInterval) {
    clearInterval(matchmakingInterval);
    matchmakingInterval = null;
  }

  if (matchmakingTitle) matchmakingTitle.textContent = '🎯 RAKİP BULUNDU!';
  if (matchmakingSubtitle) matchmakingSubtitle.textContent = 'Maç yükleniyor, hazır ol!';
  if (matchOpponentName) matchOpponentName.textContent = opponent.name;
  if (matchOpponentStats) matchOpponentStats.textContent = `Sv. ${opponent.level || level} • 🏆 ${opponent.trophies || (level * 100)}`;
  if (matchOpponentAvatar) matchOpponentAvatar.src = getAvatarDataUri(opponent.avatar || 'opponent_1');
  if (matchOpponentRing) matchOpponentRing.classList.remove('searching-pulse');

  soundManager.playWhistle();

  setTimeout(() => {
    hideAllModals();
    if (isSimulated) {
      game.startSimulatedOnlineMatch({
        roomCode,
        opponent,
        level,
        firstTurn,
      });
    } else {
      game.startOnlineMatch({
        roomCode,
        myRole,
        opponent,
        level,
        firstTurn,
      });
    }

    // Update HUD
    hudMatchBadge.textContent = isSimulated ? 'ONLINE DERECELİ' : `ODA #${roomCode}`;
    hudPlayerName.textContent = playerProfile.name;
    hudPlayerAvatar.src = getAvatarDataUri(myRole === 'host' ? 'player' : 'multiplayer_guest');
    hudOpponentName.textContent = opponent.name;
    hudOpponentAvatar.src = getAvatarDataUri(opponent.avatar || 'opponent_1');
    updateHudProfileSubtitles(opponent);
    game.updatePuckCounters();
  }, 1100);
}

// Update Audio button icon
function updateSoundButton() {
  btnSoundToggle.textContent = soundManager.isMuted() ? '🔇' : '🔊';
}
updateSoundButton();

btnSoundToggle.addEventListener('click', () => {
  soundManager.toggleMute();
  updateSoundButton();
});

// Update the 5-Stone Status Chips on the Scoreboard
function updateStoneChips(playerCount, aiCount) {
  if (playerStoneChips) {
    playerStoneChips.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const dot = document.createElement('span');
      dot.className = `chip-dot ${i < playerCount ? 'active' : 'cleared'}`;
      dot.title = `Taş ${i + 1}: ${i < playerCount ? 'Sahanda' : 'Karşıda (Geçti)'}`;
      playerStoneChips.appendChild(dot);
    }
  }

  if (opponentStoneChips) {
    opponentStoneChips.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const dot = document.createElement('span');
      dot.className = `chip-dot ${i < aiCount ? 'active' : 'cleared'}`;
      dot.title = `Taş ${i + 1}: ${i < aiCount ? 'Sahanda' : 'Karşıda (Geçti)'}`;
      opponentStoneChips.appendChild(dot);
    }
  }
}

// Display floating animated reaction emoji
function showFloatingEmoji(emoji, side = 'player') {
  if (!emojiPopupLayer) return;
  const el = document.createElement('div');
  el.className = 'floating-emoji';
  el.textContent = emoji;

  const leftPercent = side === 'player' ? 25 + Math.random() * 20 : 55 + Math.random() * 20;
  el.style.left = `${leftPercent}%`;
  el.style.bottom = side === 'player' ? '20%' : '60%';

  emojiPopupLayer.appendChild(el);
  setTimeout(() => {
    el.remove();
  }, 2300);
}

// Initialize Multiplayer Client
const multiplayerClient = new MultiplayerClient({
  onMatchStart: ({ roomCode, myRole, opponent, level, firstTurn }) => {
    revealOpponentAndStartMatch({
      roomCode,
      myRole,
      opponent,
      level,
      firstTurn,
      isSimulated: false,
    });
  },
  onMatchStartSimulated: ({ roomCode, opponent, level, firstTurn }) => {
    revealOpponentAndStartMatch({
      roomCode,
      myRole: 'host',
      opponent,
      level,
      firstTurn,
      isSimulated: true,
    });
  },
  onEmoji: (emoji, senderRole) => {
    const isPlayer = (senderRole === game.myRole);
    showFloatingEmoji(emoji, isPlayer ? 'player' : 'opponent');
  },
  onWaiting: (msg) => {
    if (joinStatusMsg) joinStatusMsg.textContent = msg;
  },
  onError: (errMsg) => {
    if (matchmakingInterval) {
      clearInterval(matchmakingInterval);
      matchmakingInterval = null;
    }
    if (joinStatusMsg) joinStatusMsg.textContent = errMsg;
    alert(errMsg);
  },
});

// Initialize Sling Puck Game
const game = new SlingPuckGame(canvas, {
  onLevelStart: (level, config) => {
    if (game.mode === 'pvp') {
      hudMatchBadge.textContent = '2 KİŞİLİK';
      hudPlayerName.textContent = '1. Oyuncu';
      hudOpponentName.textContent = '2. Oyuncu';
      hudPlayerAvatar.src = getAvatarDataUri('player');
      hudOpponentAvatar.src = getAvatarDataUri('multiplayer_guest');
    } else {
      hudMatchBadge.textContent = `BÖLÜM ${level}`;
      hudPlayerName.textContent = playerProfile.name;
      hudOpponentName.textContent = config.name;
      hudPlayerAvatar.src = getAvatarDataUri('player');
      hudOpponentAvatar.src = getAvatarDataUri(config.avatar || `opponent_${level}`);
      hudOpponentName.title = `${config.title} - ${config.desc}`;
    }
    updateHudProfileSubtitles();
  },

  onOnlineMatchStart: ({ roomCode, myRole, opponent, level, isSimulated }) => {
    hideAllModals();
    hudMatchBadge.textContent = isSimulated ? 'ONLINE DERECELİ' : `ODA #${roomCode}`;

    const nickname = (onlineNicknameInput.value.trim() || playerProfile.name || 'Sen');
    if (myRole === 'host') {
      hudPlayerName.textContent = nickname;
      hudPlayerAvatar.src = getAvatarDataUri('player');
      hudOpponentName.textContent = opponent?.name || 'Rakip';
      hudOpponentAvatar.src = getAvatarDataUri(opponent?.avatar || 'opponent_1');
    } else {
      hudPlayerName.textContent = nickname;
      hudPlayerAvatar.src = getAvatarDataUri('multiplayer_guest');
      hudOpponentName.textContent = opponent?.name || 'Oda Sahibi';
      hudOpponentAvatar.src = getAvatarDataUri(opponent?.avatar || 'player');
    }
    updateHudProfileSubtitles(opponent);
    // Refresh stone chips for current perspective
    game.updatePuckCounters();
  },

  onOpponentLeft: (msg) => {
    const disconnectMsgEl = document.getElementById('disconnect-msg');
    if (disconnectMsgEl) disconnectMsgEl.textContent = msg || 'Rakip oyundan ayrıldı.';
    modalDisconnect.classList.remove('hidden');
  },

  onPuckCountChange: (playerCount, aiCount) => {
    const isGuest = (game.mode === 'online' && game.myRole === 'guest');
    const myCount = isGuest ? aiCount : playerCount;
    const oppCount = isGuest ? playerCount : aiCount;

    playerPuckCountEl.textContent = myCount;
    aiPuckCountEl.textContent = oppCount;
    updateStoneChips(myCount, oppCount);
  },

  onTimerTick: (seconds) => {
    if (hudTurnTimer) {
      hudTurnTimer.textContent = `⏱️ ${seconds}s`;
      if (seconds <= 5 && seconds > 0) {
        hudTurnTimer.classList.add('warning');
        soundManager.playCountdownTick(seconds);
      } else {
        hudTurnTimer.classList.remove('warning');
      }
    }
  },

  onTurnTimeout: (timedOutTurn) => {
    turnBanner.className = 'turn-banner ai-turn';
    turnText.textContent = '⏱️ Süre Doldu! Sıra Rakibe Geçti!';
    turnBanner.style.opacity = '1';
  },

  onStateChange: ({ state, turn, turnCount, level, mode }) => {
    turnBanner.className = 'turn-banner';

    if (state === 'ROUND_OVER' || state === 'AIMING') {
      turnBanner.style.opacity = '0';
      return;
    }
    turnBanner.style.opacity = '1';

    if (state === 'SHOT_MOVING') {
      turnBanner.classList.add('player-turn');
      turnText.textContent = 'Taşlar Hareket Ediyor...';
      return;
    }

    if (mode === 'online') {
      const isMyTurn =
        (game.myRole === 'host' && turn === 'player') ||
        (game.myRole === 'guest' && turn === 'player2');

      if (isMyTurn) {
        turnBanner.classList.add('player-turn');
        turnText.textContent = 'Senin Sıran! Kendi Taşını Çek & Fırlat 🎯';
      } else {
        turnBanner.classList.add('ai-turn');
        turnText.textContent = 'Rakibin Sırası! Atış Bekleniyor...';
      }
      return;
    }

    if (mode === 'online_simulated') {
      if (turn === 'player') {
        turnBanner.classList.add('player-turn');
        turnText.textContent = 'Senin Sıran! Taşını Çek & Karşıya Fırlat 🎯';
      } else {
        turnBanner.classList.add('ai-turn');
        const oppName = game.multiplayerOpponent?.name || 'Rakip';
        turnText.textContent = `${oppName} Nişan Alıyor...`;
      }
      return;
    }

    if (mode === 'pvp') {
      if (turn === 'player') {
        turnBanner.classList.add('player-turn');
        turnText.textContent = '1. Oyuncu (Aşağı): Taşı Çek & Karşıya Fırlat';
      } else {
        turnBanner.classList.add('ai-turn');
        turnText.textContent = '2. Oyuncu (Yukarı): Taşı Çek & Karşıya Fırlat';
      }
    } else {
      if (turn === 'player') {
        turnBanner.classList.add('player-turn');
        turnText.textContent = 'Senin Sıran! Taşını Çek & Karşıya Fırlat';
      } else {
        turnBanner.classList.add('ai-turn');
        const config = LEVEL_CONFIGS[level - 1] || LEVEL_CONFIGS[0];
        turnText.textContent = `${config.name} Düşünüyor...`;
      }
    }
  },

  onGameOver: ({ winner, isLocalWinner, stars, shotCount, turnCount, level, mode, opponent }) => {
    const totalShots = shotCount || turnCount || 1;
    const isOnline = (mode === 'online' || mode === 'online_simulated');

    // Helper to generate star HTML with glowing gold stars and dimmed empty stars
    const renderStarHtml = (numStars) => {
      let html = '';
      for (let i = 0; i < numStars; i++) {
        html += `<span class="star-gold" style="animation-delay: ${i * 0.15}s">★</span>`;
      }
      for (let i = numStars; i < 3; i++) {
        html += '<span class="star-empty">★</span>';
      }
      return html;
    };

    if (isLocalWinner) {
      winStars.innerHTML = renderStarHtml(stars);
      winTurns.textContent = `${totalShots} Atış`;

      if (isOnline) {
        playerProfile.addWin(30);
        updateHudProfileSubtitles(opponent);

        winTrophyBox.classList.remove('hidden');
        winTrophyGain.textContent = '+30 KUPA';
        winTrophyTotal.textContent = `Toplam: ${playerProfile.trophies} 🏆 (Sv. ${playerProfile.level})`;

        btnNextOnlineMatch.classList.remove('hidden');
        btnNextLevel.classList.add('hidden');
        btnReplayLevel.classList.add('hidden');

        const oppName = opponent?.name || 'Rakip';
        winDesc.textContent = `Harika Atışlar! Çevrimiçi rakibin "${oppName}" karşısında ${totalShots} atışta zafere ulaştın!`;
      } else if (mode === 'campaign') {
        winTrophyBox.classList.add('hidden');
        btnNextOnlineMatch.classList.add('hidden');
        btnNextLevel.classList.remove('hidden');
        btnReplayLevel.classList.remove('hidden');

        const config = LEVEL_CONFIGS[level - 1];
        let compliment = 'Mükemmel Performans!';
        if (stars === 2) compliment = 'Harika Atışlar!';
        else if (stars === 1) compliment = 'Tebrikler!';

        winDesc.textContent = `${compliment} 5 taşını da ${totalShots} atışta karşıya geçirip ${config.title} etabını kazandın!`;
      } else {
        winTrophyBox.classList.add('hidden');
        btnNextOnlineMatch.classList.add('hidden');
        btnNextLevel.classList.add('hidden');
        btnReplayLevel.classList.remove('hidden');

        winDesc.textContent = `${winner === 'player' ? '1.' : '2.'} Oyuncu ${totalShots} atışta kazandı!`;
      }
      modalWin.classList.remove('hidden');
    } else {
      if (isOnline) {
        playerProfile.addLoss(10);
        updateHudProfileSubtitles(opponent);

        loseTrophyBox.classList.remove('hidden');
        loseTrophyGain.textContent = '-10 KUPA';
        loseTrophyTotal.textContent = `Toplam: ${playerProfile.trophies} 🏆 (Sv. ${playerProfile.level})`;

        btnRetryOnlineMatch.classList.remove('hidden');
        btnRetryLose.classList.add('hidden');

        const oppName = opponent?.name || 'Rakip';
        loseDesc.textContent = `"${oppName}" tüm taşlarını senin sahana geçirdi. Kupa kaybettin ama pes etmek yok!`;
      } else {
        loseTrophyBox.classList.add('hidden');
        btnRetryOnlineMatch.classList.add('hidden');
        btnRetryLose.classList.remove('hidden');

        loseDesc.textContent = 'Rakip tüm taşlarını senin sahana geçirdi. Pes etmek yok!';
      }
      modalLose.classList.remove('hidden');
    }
  },
});

// Connect game to multiplayer client
game.initMultiplayer(multiplayerClient);

// Emoji reaction bar buttons
document.querySelectorAll('.emoji-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const emoji = btn.dataset.emoji;
    showFloatingEmoji(emoji, 'player');
    soundManager.playClick();
    if (game.mode === 'online') {
      multiplayerClient.sendEmoji(emoji);
    }
  });
});

// Render Level Select Grid (10 unique levels)
function renderLevelGrid() {
  levelGrid.innerHTML = '';
  const unlocked = game.unlockedLevel;
  const current = game.currentLevel;

  LEVEL_CONFIGS.forEach((cfg) => {
    const isUnlocked = cfg.level <= unlocked;
    const isCurrent = cfg.level === current;
    const starsEarned = game.stars[cfg.level] || 0;

    const card = document.createElement('div');
    card.className = `level-card ${isUnlocked ? 'unlocked' : 'locked'} ${
      isCurrent ? 'current' : ''
    }`;

    let starsText = '';
    if (isUnlocked) {
      for (let s = 0; s < 3; s++) {
        starsText += s < starsEarned ? '★' : '☆';
      }
    } else {
      starsText = '🔒';
    }

    card.innerHTML = `
      <div class="level-card-num">${cfg.level}</div>
      <div class="level-card-stars">${starsText}</div>
    `;

    if (isUnlocked) {
      card.addEventListener('click', () => {
        soundManager.playClick();
        game.setMode('campaign');
        game.startLevel(cfg.level);
        hideAllModals();
      });
    }

    levelGrid.appendChild(card);
  });
}

// Online Multiplayer Modal & Tabs
btnOpenMultiplayer.addEventListener('click', () => {
  soundManager.playClick();
  modalMenu.classList.add('hidden');
  modalMultiplayer.classList.remove('hidden');
  if (joinStatusMsg) joinStatusMsg.textContent = '';
});

btnCloseMultiplayer.addEventListener('click', () => {
  soundManager.playClick();
  modalMultiplayer.classList.add('hidden');
  modalMenu.classList.remove('hidden');
  multiplayerClient.cancelQuickMatch();
  quickMatchWaiting.classList.add('hidden');
});

// Tab switching
tabBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    soundManager.playClick();
    tabBtns.forEach((b) => b.classList.remove('active'));
    tabPanes.forEach((p) => p.classList.add('hidden'));

    btn.classList.add('active');
    const targetPane = document.getElementById(btn.dataset.tab);
    if (targetPane) targetPane.classList.remove('hidden');
  });
});

// 1. Create Room button
btnCreateRoom.addEventListener('click', async () => {
  soundManager.playClick();
  const nickname = onlineNicknameInput.value.trim() || 'Sen';
  try {
    await multiplayerClient.createRoom(nickname, 'player', 1);
    createdRoomCode.textContent = multiplayerClient.roomCode;
    panelRoomCreated.classList.remove('hidden');
    btnCreateRoom.classList.add('hidden');
  } catch (err) {
    alert('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
  }
});

// Copy Room Code button
btnCopyCode.addEventListener('click', () => {
  soundManager.playClick();
  const code = createdRoomCode.textContent;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).then(() => {
      btnCopyCode.textContent = 'Kopyalandı! ✓';
      setTimeout(() => (btnCopyCode.textContent = 'Kopyala 📋'), 2000);
    });
  }
});

// 2. Join Room button
btnJoinRoom.addEventListener('click', async () => {
  soundManager.playClick();
  const code = inputRoomCode.value.trim();
  const nickname = onlineNicknameInput.value.trim() || 'Misafir';

  if (!code || code.length !== 4) {
    joinStatusMsg.textContent = 'Lütfen 4 haneli oda kodunu girin!';
    return;
  }

  joinStatusMsg.textContent = 'Odaya bağlanılıyor...';
  try {
    await multiplayerClient.joinRoom(code, nickname, 'multiplayer_guest');
  } catch (err) {
    joinStatusMsg.textContent = 'Odaya bağlanılamadı. Kod kontrol edin.';
  }
});

// 3. Quick Match button
btnQuickMatch.addEventListener('click', () => {
  startMatchmakingSearch();
});

// Prominent Online Match / Play buttons
if (btnHudPlay) btnHudPlay.addEventListener('click', startMatchmakingSearch);
if (btnPlayOnlineMain) btnPlayOnlineMain.addEventListener('click', startMatchmakingSearch);
if (btnCancelMatchmaking) btnCancelMatchmaking.addEventListener('click', cancelMatchmakingSearch);
if (btnNextOnlineMatch) btnNextOnlineMatch.addEventListener('click', startMatchmakingSearch);
if (btnRetryOnlineMatch) btnRetryOnlineMatch.addEventListener('click', startMatchmakingSearch);
if (btnMenuFromWin) {
  btnMenuFromWin.addEventListener('click', () => {
    soundManager.playClick();
    hideAllModals();
    modalMenu.classList.remove('hidden');
  });
}

// Menu Button Interactions
btnResumeGame.addEventListener('click', () => {
  soundManager.playClick();
  hideAllModals();
  if (game.physics.pucks.length === 0) {
    game.startLevel(game.currentLevel);
  }
});

btnOpenMenu.addEventListener('click', () => {
  soundManager.playClick();
  modalMenu.classList.remove('hidden');
});

btnSelectLevels.addEventListener('click', () => {
  soundManager.playClick();
  modalMenu.classList.add('hidden');
  renderLevelGrid();
  modalLevels.classList.remove('hidden');
});

btnCloseLevels.addEventListener('click', () => {
  soundManager.playClick();
  modalLevels.classList.add('hidden');
  modalMenu.classList.remove('hidden');
});

btnModePvp.addEventListener('click', () => {
  soundManager.playClick();
  hideAllModals();
  game.setMode('pvp');
});

btnHowToPlay.addEventListener('click', () => {
  soundManager.playClick();
  modalMenu.classList.add('hidden');
  modalTutorial.classList.remove('hidden');
});

btnCloseTutorial.addEventListener('click', () => {
  soundManager.playClick();
  hideAllModals();
  if (game.physics.pucks.length === 0) {
    game.startLevel(game.currentLevel);
  }
});

// Victory buttons
btnNextLevel.addEventListener('click', () => {
  soundManager.playClick();
  hideAllModals();
  if (game.mode === 'online') {
    multiplayerClient.requestRematch(game.currentLevel);
  } else {
    const next = game.currentLevel < 10 ? game.currentLevel + 1 : 1;
    game.startLevel(next);
  }
});

btnReplayLevel.addEventListener('click', () => {
  soundManager.playClick();
  hideAllModals();
  if (game.mode === 'online') {
    multiplayerClient.requestRematch(game.currentLevel);
  } else {
    game.startLevel(game.currentLevel);
  }
});

// Defeat buttons
btnRetryLose.addEventListener('click', () => {
  soundManager.playClick();
  hideAllModals();
  if (game.mode === 'online') {
    multiplayerClient.requestRematch(game.currentLevel);
  } else {
    game.startLevel(game.currentLevel);
  }
});

btnMenuFromLose.addEventListener('click', () => {
  soundManager.playClick();
  hideAllModals();
  modalMenu.classList.remove('hidden');
});

btnDisconnectMenu.addEventListener('click', () => {
  soundManager.playClick();
  hideAllModals();
  game.setMode('campaign');
  modalMenu.classList.remove('hidden');
});

// Initial startup
const hashMatch = window.location.hash.match(/level[=-]?(\d+)/i);
if (hashMatch) {
  const lvl = parseInt(hashMatch[1], 10);
  if (lvl >= 1 && lvl <= 10) {
    game.currentLevel = lvl;
  }
}

game.startLevel(game.currentLevel);
window.__game = game;
window.__multiplayerClient = multiplayerClient;
window.__soundManager = soundManager;
