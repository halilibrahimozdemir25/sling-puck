// Client-Side Real-Time Online Multiplayer Client for Sling Puck

export class MultiplayerClient {
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    this.ws = null;
    this.isConnected = false;
    this.roomCode = null;
    this.myRole = null; // 'host' | 'guest'
    this.myPlayer = null;
    this.opponentPlayer = null;
    this.isOnlineMatch = false;
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.isConnected = true;
          resolve();
        };

        this.ws.onerror = (err) => {
          reject(err);
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          if (this.callbacks.onDisconnected) {
            this.callbacks.onDisconnected();
          }
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (e) {
            console.error('Invalid WS message:', e);
          }
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  handleMessage(msg) {
    switch (msg.type) {
      case 'ROOM_CREATED':
        this.roomCode = msg.roomCode;
        this.myRole = 'host';
        if (this.callbacks.onRoomCreated) {
          this.callbacks.onRoomCreated(msg.roomCode);
        }
        break;

      case 'WAITING_FOR_OPPONENT':
        if (this.callbacks.onWaiting) {
          this.callbacks.onWaiting(msg.message);
        }
        break;

      case 'MATCH_START':
        this.roomCode = msg.roomCode;
        this.isOnlineMatch = true;
        this.myRole = msg.role || this.myRole;
        this.opponentPlayer = this.myRole === 'host' ? msg.guest : msg.host;
        this.myPlayer = this.myRole === 'host' ? msg.host : msg.guest;

        if (this.callbacks.onMatchStart) {
          this.callbacks.onMatchStart({
            roomCode: msg.roomCode,
            level: msg.level,
            myRole: this.myRole,
            opponent: this.opponentPlayer,
            firstTurn: msg.firstTurn,
          });
        }
        break;

      case 'MATCH_START_SIMULATED':
        this.roomCode = msg.roomCode;
        this.isOnlineMatch = false; // Simulated online match using AI engine
        this.myRole = 'host';
        this.opponentPlayer = msg.opponent;

        if (this.callbacks.onMatchStartSimulated) {
          this.callbacks.onMatchStartSimulated({
            roomCode: msg.roomCode,
            level: msg.level,
            opponent: msg.opponent,
            firstTurn: msg.firstTurn,
          });
        }
        break;

      case 'OPPONENT_AIM':
        if (this.callbacks.onOpponentAim) {
          this.callbacks.onOpponentAim(msg.aiming, msg.pull, msg.puckId);
        }
        break;

      case 'OPPONENT_SHOT':
        if (this.callbacks.onOpponentShot) {
          this.callbacks.onOpponentShot(msg.puckId, msg.impulse, msg.origin, msg.puckStates);
        }
        break;

      case 'PUCK_SYNC':
        if (this.callbacks.onPuckSync) {
          this.callbacks.onPuckSync(msg.pucks);
        }
        break;

      case 'SHOT_SETTLED':
        if (this.callbacks.onShotSettled) {
          this.callbacks.onShotSettled(msg);
        }
        break;

      case 'EMOJI':
        if (this.callbacks.onEmoji) {
          this.callbacks.onEmoji(msg.emoji, msg.sender);
        }
        break;

      case 'REMATCH_START':
        if (this.callbacks.onRematchStart) {
          this.callbacks.onRematchStart(msg.level);
        }
        break;

      case 'PLAYER_DISCONNECTED':
        this.isOnlineMatch = false;
        if (this.callbacks.onOpponentLeft) {
          this.callbacks.onOpponentLeft(msg.message);
        }
        break;

      case 'ERROR':
        if (this.callbacks.onError) {
          this.callbacks.onError(msg.message);
        }
        break;
    }
  }

  async createRoom(playerName, avatar, level = 1) {
    await this.connect();
    this.myRole = 'host';
    this.ws.send(JSON.stringify({
      type: 'CREATE_ROOM',
      playerName,
      avatar,
      level,
    }));
  }

  async joinRoom(roomCode, playerName, avatar) {
    await this.connect();
    this.myRole = 'guest';
    this.ws.send(JSON.stringify({
      type: 'JOIN_ROOM',
      roomCode,
      playerName,
      avatar,
    }));
  }

  async quickMatch(playerName, avatar, level = 1, trophies = 100) {
    await this.connect();
    this.ws.send(JSON.stringify({
      type: 'QUICK_MATCH',
      playerName,
      avatar,
      level,
      trophies,
    }));
  }

  cancelQuickMatch() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'CANCEL_MATCH' }));
    }
  }

  sendAim(aiming, pull, puckId) {
    if (this.isOnlineMatch && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'AIM_UPDATE',
        aiming,
        pull,
        puckId,
      }));
    }
  }

  sendShot(puckId, impulse, origin, puckStates = null) {
    if (this.isOnlineMatch && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'SHOT_FIRED',
        puckId,
        impulse,
        origin,
        puckStates,
      }));
    }
  }

  sendPuckSync(pucks) {
    if (this.isOnlineMatch && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'PUCK_SYNC',
        pucks,
      }));
    }
  }

  sendShotSettled(puckStates, playerCount, aiCount, nextTurn) {
    if (this.isOnlineMatch && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'SHOT_SETTLED',
        puckStates,
        playerCount,
        aiCount,
        nextTurn,
      }));
    }
  }

  sendEmoji(emoji) {
    if (this.isOnlineMatch && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'CHAT_EMOJI',
        emoji,
      }));
    }
  }

  requestRematch(level = 1) {
    if (this.isOnlineMatch && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'REMATCH',
        level,
      }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.isOnlineMatch = false;
    this.roomCode = null;
  }
}
