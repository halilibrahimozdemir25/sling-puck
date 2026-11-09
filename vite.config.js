import { defineConfig } from 'vite';
import { WebSocketServer } from 'ws';
import { setupMultiplayerServer } from './server/multiplayerServer.js';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  plugins: [
    {
      name: 'vite-multiplayer-ws',
      configureServer(server) {
        const wss = new WebSocketServer({ noServer: true });
        setupMultiplayerServer(wss);

        server.httpServer.on('upgrade', (req, socket, head) => {
          if (req.url && (req.url.startsWith('/ws') || req.url.startsWith('/multiplayer'))) {
            wss.handleUpgrade(req, socket, head, (ws) => {
              wss.emit('connection', ws, req);
            });
          }
        });
      },
    },
  ],
});
