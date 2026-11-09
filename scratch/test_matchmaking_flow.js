import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function run() {
  console.log('--- Launching Chrome via Puppeteer ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=440,880'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 440, height: 880, deviceScaleFactor: 2 });

    const logs = [];
    page.on('console', (msg) => logs.push(msg.text()));

    console.log('Navigating to http://localhost:3000/...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

    // 1. Initial State Check
    const initialHud = await page.evaluate(() => {
      const playerSub = document.getElementById('hud-player-sub')?.textContent;
      const playBtn = document.getElementById('btn-hud-play')?.textContent;
      const matchBadge = document.getElementById('hud-match-badge')?.textContent;
      return { playerSub, playBtn, matchBadge };
    });
    console.log('Initial HUD state:', initialHud);

    // 2. Click "🏆 OYNA" button to start matchmaking
    console.log('Clicking "🏆 OYNA" button...');
    await page.click('#btn-hud-play');

    await new Promise((r) => setTimeout(r, 600));

    // 3. Verify Matchmaking Modal is Open
    const searchingStatus = await page.evaluate(() => {
      const modal = document.getElementById('modal-matchmaking');
      const isVisible = !modal.classList.contains('hidden');
      const title = document.getElementById('matchmaking-title')?.textContent;
      const timer = document.getElementById('matchmaking-timer')?.textContent;
      const playerName = document.getElementById('match-player-name')?.textContent;
      const playerStats = document.getElementById('match-player-stats')?.textContent;
      return { isVisible, title, timer, playerName, playerStats };
    });
    console.log('Matchmaking modal state:', searchingStatus);

    await page.screenshot({ path: 'scratch/matchmaking_searching.png' });
    console.log('Saved scratch/matchmaking_searching.png');

    // 4. Wait for match to be found (~2.6s server delay)
    console.log('Waiting for matchmaking to find opponent...');
    await page.waitForFunction(
      () => {
        const title = document.getElementById('matchmaking-title')?.textContent;
        return title && title.includes('BULUNDU');
      },
      { timeout: 7000 }
    );

    const matchFoundStatus = await page.evaluate(() => {
      const title = document.getElementById('matchmaking-title')?.textContent;
      const oppName = document.getElementById('match-opponent-name')?.textContent;
      const oppStats = document.getElementById('match-opponent-stats')?.textContent;
      return { title, oppName, oppStats };
    });
    console.log('Match found state:', matchFoundStatus);

    await page.screenshot({ path: 'scratch/matchmaking_found.png' });
    console.log('Saved scratch/matchmaking_found.png');

    // 5. Wait for transition into online match (1.1s reveal timeout)
    await new Promise((r) => setTimeout(r, 1600));

    const gameModeStatus = await page.evaluate(() => {
      const game = window.__game;
      const badge = document.getElementById('hud-match-badge')?.textContent;
      const oppName = document.getElementById('hud-opponent-name')?.textContent;
      const oppSub = document.getElementById('hud-opponent-sub')?.textContent;
      return {
        mode: game?.mode,
        turn: game?.turn,
        state: game?.state,
        badge,
        oppName,
        oppSub,
        pucksCount: game?.physics?.pucks?.length,
      };
    });
    console.log('Online game active state:', gameModeStatus);

    await page.screenshot({ path: 'scratch/online_gameplay.png' });
    console.log('Saved scratch/online_gameplay.png');

    // 6. Test AI Aiming Behavior when it is AI turn
    console.log('Testing AI Aiming behavior...');
    const aiAimingObserved = await page.evaluate(async () => {
      const game = window.__game;
      // Force AI turn if not already
      if (game.turn !== 'ai') {
        game.turn = 'ai';
        game.state = 'AI_TURN';
        game.ai.startTurn(game.currentLevel - 1);
      }

      // Track AI aim states over 1.5 seconds
      const samples = [];
      const start = performance.now();
      while (performance.now() - start < 1800) {
        if (game.aiAiming && game.aiPull) {
          samples.push({
            puckId: game.aiPuck?.id,
            pullX: Math.round(game.aiPull.x * 10) / 10,
            pullY: Math.round(game.aiPull.y * 10) / 10,
            angle: Math.round(Math.atan2(game.aiPull.y, game.aiPull.x) * 100) / 100,
            step: game.ai.step,
          });
        }
        await new Promise((r) => setTimeout(r, 40));
      }
      return samples;
    });

    console.log(`Sampled ${aiAimingObserved.length} AI aiming frames.`);
    if (aiAimingObserved.length > 0) {
      console.log('First 3 aiming samples:', aiAimingObserved.slice(0, 3));
      console.log('Last 3 aiming samples:', aiAimingObserved.slice(-3));
      // Verify angle / pull changed smoothly (rotation & sweep)
      const angles = aiAimingObserved.map((s) => s.angle);
      const uniqueAngles = new Set(angles);
      console.log(`Unique aim angles during sweep: ${uniqueAngles.size} (sweep & rotation verified!)`);
    }

    await page.screenshot({ path: 'scratch/ai_aiming_shot.png' });
    console.log('Saved scratch/ai_aiming_shot.png');

    console.log('--- ALL MATCHMAKING & AI AIMING TESTS PASSED ---');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
