// Real-Time Online Multiplayer Room Server for Sling Puck
// Handles Rooms, Real Player Quick Match & Dynamic Simulated Opponents (SBMM)

const REALISTIC_BOT_NAMES = [
  'Bora_TR', 'EmrePro_06', 'Selin_Star', 'KaanTheLegend', 'Ece_Goal',
  'Alex_Sniper', 'Can_99', 'Zeynep_K', 'Rüzgar_Fb', 'Kuzey_Gs',
  'Baris_Bjk', 'DarkKnight_7', 'SlingMaster', 'CyberHero', 'Leo_Pro',
  'Yusuf_01', 'KralForvet', 'Gizem_35', 'Arda_10', 'Deniz_Sky',
  'Samet_34', 'ProGamerX', 'Berk_98', 'Elif_Star', 'Mert_07',
  'SpeedyTurk', 'GamerGirl_Ece', 'Onur_TheAce', 'Cem_Puck', 'Melis_01',
  'GhostShooter', 'Titan_99', 'Nova_Sniper', 'Vortex_TR', 'Storm_Strike',
  'Apex_Player', 'Champion_Efe', 'Falcon_06', 'Batu_Star', 'Kaan_TR',
  'Cagla_Pro', 'Hakan_Power', 'Emir_35', 'Alperen_10', 'Defne_Goal',
];

const BOT_AVATAR_KEYS = [
  'opponent_1', 'opponent_2', 'opponent_3', 'opponent_4', 'opponent_5',
  'opponent_6', 'opponent_7', 'opponent_8', 'opponent_9', 'opponent_10',
];

export function setupMultiplayerServer(wss) {
  const rooms = new Map(); // roomCode -> Room
  const waitingQueue = []; // array of { ws, name, avatar, level, trophies, timer }

  function generateRoomCode() {
    let code;
    do {
      code = Math.floor(1000 + Math.random() * 9000).toString();
    } while (rooms.has(code));
    return code;
  }

  function broadcastToRoom(room, message, excludeWs = null) {
    const data = JSON.stringify(message);
    if (room.host && room.host.ws !== excludeWs && room.host.ws.readyState === 1) {
      room.host.ws.send(data);
    }
    if (room.guest && room.guest.ws !== excludeWs && room.guest.ws.readyState === 1) {
      room.guest.ws.send(data);
    }
  }

  function sendMatchStart(room) {
    const baseMatchData = {
      type: 'MATCH_START',
      roomCode: room.code,
      level: room.level || 1,
      host: { name: room.host.name, avatar: room.host.avatar },
      guest: { name: room.guest.name, avatar: room.guest.avatar },
      firstTurn: 'player', // host plays first
    };

    if (room.host && room.host.ws && room.host.ws.readyState === 1) {
      room.host.ws.send(JSON.stringify({ ...baseMatchData, role: 'host' }));
    }
    if (room.guest && room.guest.ws && room.guest.ws.readyState === 1) {
      room.guest.ws.send(JSON.stringify({ ...baseMatchData, role: 'guest' }));
    }
  }

  wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.currentRoomCode = null;
    ws.playerRole = null; // 'host' | 'guest'

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        switch (msg.type) {
          case 'CREATE_ROOM': {
            const roomCode = generateRoomCode();
            const room = {
              code: roomCode,
              host: {
                ws,
                name: msg.playerName || '1. Oyuncu',
                avatar: msg.avatar || 'player',
              },
              guest: null,
              state: 'WAITING',
              level: msg.level || 1,
            };
            rooms.set(roomCode, room);
            ws.currentRoomCode = roomCode;
            ws.playerRole = 'host';

            ws.send(JSON.stringify({
              type: 'ROOM_CREATED',
              roomCode,
              role: 'host',
              player: room.host,
            }));
            break;
          }

          case 'JOIN_ROOM': {
            const roomCode = (msg.roomCode || '').trim();
            const room = rooms.get(roomCode);

            if (!room) {
              ws.send(JSON.stringify({
                type: 'ERROR',
                message: `"${roomCode}" kodlu oda bulunamadı.`,
              }));
              return;
            }

            if (room.guest && room.guest.ws.readyState === 1) {
              ws.send(JSON.stringify({
                type: 'ERROR',
                message: 'Bu oda şu an dolu.',
              }));
              return;
            }

            room.guest = {
              ws,
              name: msg.playerName || '2. Oyuncu',
              avatar: msg.avatar || 'multiplayer_guest',
            };
            room.state = 'PLAYING';
            ws.currentRoomCode = roomCode;
            ws.playerRole = 'guest';

            // Notify both players that game is ready with their personalized roles!
            sendMatchStart(room);
            break;
          }

          case 'QUICK_MATCH': {
            // Cancel any previous search for this socket
            const existingIdx = waitingQueue.findIndex((w) => w.ws === ws);
            if (existingIdx !== -1) {
              if (waitingQueue[existingIdx].timer) clearTimeout(waitingQueue[existingIdx].timer);
              waitingQueue.splice(existingIdx, 1);
            }

            // 1. Check if there is another real human waiting in the queue
            let opponent = null;
            while (waitingQueue.length > 0) {
              const candidate = waitingQueue.shift();
              if (candidate.timer) clearTimeout(candidate.timer);
              if (candidate.ws !== ws && candidate.ws.readyState === 1) {
                opponent = candidate;
                break;
              }
            }

            if (opponent) {
              // Real Human Match! Two live players are paired together!
              const roomCode = generateRoomCode();
              const level = Math.max(1, Math.min(10, Math.round(((msg.level || 1) + (opponent.level || 1)) / 2)));
              const room = {
                code: roomCode,
                host: opponent,
                guest: {
                  ws,
                  name: msg.playerName || '2. Oyuncu',
                  avatar: msg.avatar || 'multiplayer_guest',
                  level: msg.level || 1,
                  trophies: msg.trophies || 100,
                },
                state: 'PLAYING',
                level,
              };
              rooms.set(roomCode, room);

              opponent.ws.currentRoomCode = roomCode;
              opponent.ws.playerRole = 'host';
              ws.currentRoomCode = roomCode;
              ws.playerRole = 'guest';

              sendMatchStart(room);
            } else {
              // 2. No real player yet: wait for a real opponent for ~2.6 seconds.
              // If no real human joins within 2.6s, match seamlessly with a simulated online opponent!
              const playerLevel = Math.max(1, Math.min(10, msg.level || 1));
              const playerTrophies = Math.max(0, msg.trophies || 100);

              const queueItem = {
                ws,
                name: msg.playerName || 'Sen',
                avatar: msg.avatar || 'player',
                level: playerLevel,
                trophies: playerTrophies,
                timer: null,
              };

              queueItem.timer = setTimeout(() => {
                const idx = waitingQueue.indexOf(queueItem);
                if (idx !== -1) {
                  waitingQueue.splice(idx, 1);
                }

                if (ws.readyState === 1) {
                  // Generate realistic random bot opponent scaled to player's level
                  const randName = REALISTIC_BOT_NAMES[Math.floor(Math.random() * REALISTIC_BOT_NAMES.length)];
                  const randAvatar = BOT_AVATAR_KEYS[Math.min(playerLevel - 1, BOT_AVATAR_KEYS.length - 1)];
                  const botTrophies = Math.max(20, playerTrophies + Math.floor(Math.random() * 36 - 18));

                  ws.send(JSON.stringify({
                    type: 'MATCH_START_SIMULATED',
                    roomCode: 'ONLINE_' + Math.floor(1000 + Math.random() * 9000),
                    level: playerLevel,
                    opponent: {
                      name: randName,
                      avatar: randAvatar,
                      level: playerLevel,
                      trophies: botTrophies,
                      isBot: true,
                    },
                    firstTurn: Math.random() < 0.65 ? 'player' : 'ai',
                  }));
                }
              }, 2600);

              waitingQueue.push(queueItem);

              ws.send(JSON.stringify({
                type: 'WAITING_FOR_OPPONENT',
                message: 'Rakip aranıyor...',
              }));
            }
            break;
          }

          case 'CANCEL_MATCH': {
            const idx = waitingQueue.findIndex((w) => w.ws === ws);
            if (idx !== -1) {
              if (waitingQueue[idx].timer) clearTimeout(waitingQueue[idx].timer);
              waitingQueue.splice(idx, 1);
            }
            ws.send(JSON.stringify({ type: 'MATCH_CANCELED' }));
            break;
          }

          case 'AIM_UPDATE': {
            // Relay real-time aiming vector to opponent
            if (ws.currentRoomCode) {
              const room = rooms.get(ws.currentRoomCode);
              if (room) {
                broadcastToRoom(room, {
                  type: 'OPPONENT_AIM',
                  aiming: msg.aiming,
                  pull: msg.pull,
                  puckId: msg.puckId,
                }, ws);
              }
            }
            break;
          }

          case 'SHOT_FIRED': {
            // Relay shot impulse and synchronized puck positions to opponent
            if (ws.currentRoomCode) {
              const room = rooms.get(ws.currentRoomCode);
              if (room) {
                broadcastToRoom(room, {
                  type: 'OPPONENT_SHOT',
                  puckId: msg.puckId,
                  impulse: msg.impulse,
                  origin: msg.origin,
                  puckStates: msg.puckStates,
                }, ws);
              }
            }
            break;
          }

          case 'PUCK_SYNC': {
            // Live continuous puck position & velocity streaming during shot flight
            if (ws.currentRoomCode) {
              const room = rooms.get(ws.currentRoomCode);
              if (room) {
                broadcastToRoom(room, {
                  type: 'PUCK_SYNC',
                  pucks: msg.pucks,
                }, ws);
              }
            }
            break;
          }

          case 'SHOT_SETTLED': {
            // Relay authoritative settle event when all pucks stop moving
            if (ws.currentRoomCode) {
              const room = rooms.get(ws.currentRoomCode);
              if (room) {
                broadcastToRoom(room, {
                  type: 'SHOT_SETTLED',
                  puckStates: msg.puckStates,
                  playerCount: msg.playerCount,
                  aiCount: msg.aiCount,
                  nextTurn: msg.nextTurn,
                }, ws);
              }
            }
            break;
          }

          case 'CHAT_EMOJI': {
            if (ws.currentRoomCode) {
              const room = rooms.get(ws.currentRoomCode);
              if (room) {
                broadcastToRoom(room, {
                  type: 'EMOJI',
                  sender: ws.playerRole,
                  emoji: msg.emoji,
                });
              }
            }
            break;
          }

          case 'REMATCH': {
            if (ws.currentRoomCode) {
              const room = rooms.get(ws.currentRoomCode);
              if (room) {
                broadcastToRoom(room, {
                  type: 'REMATCH_START',
                  level: msg.level || room.level,
                });
              }
            }
            break;
          }
        }
      } catch (err) {
        console.error('Multiplayer msg error:', err);
      }
    });

    ws.on('close', () => {
      // Remove from waiting queue and cancel timer
      const qIdx = waitingQueue.findIndex((w) => w.ws === ws);
      if (qIdx !== -1) {
        if (waitingQueue[qIdx].timer) clearTimeout(waitingQueue[qIdx].timer);
        waitingQueue.splice(qIdx, 1);
      }

      // Handle room disconnect
      if (ws.currentRoomCode) {
        const room = rooms.get(ws.currentRoomCode);
        if (room) {
          broadcastToRoom(room, {
            type: 'PLAYER_DISCONNECTED',
            role: ws.playerRole,
            message: 'Rakip oyundan ayrıldı.',
          }, ws);
          rooms.delete(ws.currentRoomCode);
        }
      }
    });
  });

  console.log('Multiplayer WebSocket room service initialized.');
}
