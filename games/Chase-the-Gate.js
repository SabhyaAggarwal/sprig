/*
@title: Chase The Gate (Multi-level)
@author: Sabhya Aggarwal
@description: Touch the green core to activate, then catch the red square. Multiple levels!
@addedOn: 2026-04-29
@tags: []
*/

const player = "p";
const wall = "w";
const core = "c";
const gate = "g";

setLegend(
  [player, bitmap`
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000`],
  [wall, bitmap`
1111111111111111
1111111111111111
1111111111111111
1111111111111111
1111111111111111
1111111111111111
1111111111111111
1111111111111111
1111111111111111
1111111111111111
1111111111111111
1111111111111111
1111111111111111
1111111111111111
1111111111111111
1111111111111111`],
  [core, bitmap`
4444444444444444
4444444444444444
4444444444444444
4444444444444444
4444444444444444
4444444444444444
4444444444444444
4444444444444444
4444444444444444
4444444444444444
4444444444444444
4444444444444444
4444444444444444
4444444444444444
4444444444444444
4444444444444444`],
  [gate, bitmap`
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333`]
);

setSolids([player, wall, gate]);

// Each map must have the same number of columns on every line!
const levels = [
  map`
wwwwwwwwwwwwww
w............w
w...c........w
w............w
w.......g....w
w............w
w...p........w
wwwwwwwwwwwwww
`,
  map`
wwwwwwwwwwwwww.
w....w.w.....w.
w..c.w.w.g...w.
w....w.....w.w.
w.wwwwwwww.w.w.
w...........pw.
wwwwwwwwwwwwww.
`, // 15 columns
  map`
wwwwwwwwwwwwwwww
w..c..w......w.w
www.w.www.wwww.w
w.w.........g..w
w.wwwwww.wwwwwww
w............p.w
wwwwwwwwwwwwwwww`, //18 columns
  map`
wwwwwwwwwwwwwwww
wp..w.....w....w
w.wwww.w.gw.w..w
w.........w.c..w
w.www.wwwww.wwww
w..............w
wwwwwwwwwwwwwwww`, //18 columns
  map`
wwwwwwwwwwwwwwww
w.p..........g.w
w.www.w.wwwwww.w
ww....w..c.....w
wwwwwwwwwwwwww.w
w..............w
wwwwwwwwwwwwwwww` //18 columns
];

// fix level lengths by padding rows with '.' as needed so all lines have same length per level
function padLevel(levelStr) {
  const lines = levelStr.trim().split('\n');
  const maxLen = Math.max(...lines.map(line => line.length));
  return lines.map(line => line.padEnd(maxLen, '.')).join('\n');
}

// If you want guaranteed rectangular validation, you could do:
const levelsRect = levels.map(lv => map`${padLevel(lv)}`);

let currentLevel = 0;
let hasCore = false;
let gameOver = false;

// Use levelsRect instead of levels:
function startLevel(n) {
  setMap(levelsRect[n]);
  hasCore = false;
  gameOver = false;
  clearText();
  addText(`Level ${n+1}`, { y: 0, color: color`3` });
}

startLevel(currentLevel);

function tryMovePlayer(dx, dy) {
  if (gameOver) return;
  const p = getFirst(player);
  if (!p) return;

  const nx = p.x + dx;
  const ny = p.y + dy;
  const tile = getTile(nx, ny);
  if (tile.some(s => s.type === wall || s.type === gate)) return;

  p.x = nx;
  p.y = ny;
}

onInput("w", () => tryMovePlayer(0, -1));
onInput("s", () => tryMovePlayer(0, 1));
onInput("a", () => tryMovePlayer(-1, 0));
onInput("d", () => tryMovePlayer(1, 0));

function tryMoveGate() {
  if (gameOver) return;

  const p = getFirst(player);
  const g = getFirst(gate);
  if (!p || !g) return;

  const w = width();
  const h = height();

  function isFree(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return false;
    const tile = getTile(x, y);
    return !tile.some(s => s.type === wall || s.type === gate);
  }

  let dx = g.x - p.x;
  let dy = g.y - p.y;
  if (dx > 1) dx = 1;
  if (dx < -1) dx = -1;
  if (dy > 1) dy = 1;
  if (dy < -1) dy = -1;

  const candidates = [];

  if (dx !== 0 || dy !== 0) {
    candidates.push({ x: g.x + dx, y: g.y + dy });
  }

  const slips = [];
  if (dx !== 0) {
    slips.push({ x: g.x,     y: g.y + 1 });
    slips.push({ x: g.x,     y: g.y - 1 });
  }
  if (dy !== 0) {
    slips.push({ x: g.x + 1, y: g.y });
    slips.push({ x: g.x - 1, y: g.y });
  }
  if (dx === 0 && dy === 0) {
    slips.push(
      { x: g.x + 1, y: g.y },
      { x: g.x - 1, y: g.y },
      { x: g.x,     y: g.y + 1 },
      { x: g.x,     y: g.y - 1 },
    );
  }

  for (let i = slips.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [slips[i], slips[j]] = [slips[j], slips[i]];
  }

  candidates.push(...slips);

  for (const m of candidates) {
    if (isFree(m.x, m.y)) {
      g.x = m.x;
      g.y = m.y;
      break;
    }
  }
}

function gameStep() {
  if (gameOver) return;

  tryMoveGate();

  const p = getFirst(player);
  if (!p) return;

  getTile(p.x, p.y).forEach(sprite => {
    if (sprite.type === core) {
      sprite.remove();
      hasCore = true;
      clearText();
      addText("CORE ACTIVE", { y: 1, color: color`2` });
    }
  });

  if (hasCore) {
    const neighbors = [
      ...getTile(p.x + 1, p.y),
      ...getTile(p.x - 1, p.y),
      ...getTile(p.x, p.y + 1),
      ...getTile(p.x, p.y - 1)
    ];
    if (neighbors.some(s => s.type === gate)) {
      clearText();
      addText("WARP COMPLETE", { y: 4, color: color`3` });

      gameOver = true;

      setTimeout(() => {
        if (currentLevel < levelsRect.length - 1) {
          currentLevel += 1;
          startLevel(currentLevel);
        } else {
          clearText();
          addText("YOU WIN!", { y: 4, color: color`4` });
        }
      }, 1000);
    }
  }
}

const TICK_MS = 150;
setInterval(gameStep, TICK_MS);

afterInput(() => {});
