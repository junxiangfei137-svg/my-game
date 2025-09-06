// ---------------- canvas & context ----------------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ---------------- 游戏对象 ----------------
const map = new GameMap();
const player = new Player(100, 200);
const camera = new Camera(player, map.width, 640); // 640 = 原始屏幕宽度
const hud = new HUD(player);

// ---------------- 背景音乐 ----------------
const bgm = new Audio("./assets/music/bgm.mp3");
bgm.loop = true;
bgm.volume = 0.1;

function startBGM() {
  bgm.play().catch((err) => console.log("BGM播放被阻止", err));
}
window.addEventListener("click", startBGM, { once: true });
window.addEventListener("keydown", startBGM, { once: true });

// ---------------- 缩放 & 偏移 ----------------
let scale = 1;
let offsetX = 0,
  offsetY = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const scaleX = canvas.width / 640;
  const scaleY = canvas.height / 480;
  scale = Math.min(scaleX, scaleY);

  offsetX = (canvas.width - 640 * scale) / 2;
  offsetY = (canvas.height - 480 * scale) / 2;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ---------------- 输入 ----------------
const Input = { down: {}, pressed: {} };
window.addEventListener("keydown", (e) => {
  if (!Input.down[e.key]) Input.pressed[e.key] = true;
  Input.down[e.key] = true;
});
window.addEventListener("keyup", (e) => {
  Input.down[e.key] = false;
});

// ---------------- 游戏状态 ----------------
let gameOver = false;
let gameWin = false;
let gamePaused = true; // 与弹窗共用
let tutorialActive = true; // 首次教程弹窗

// ---------------- 游戏回调 ----------------
function endGameWin() {
  if (!gameOver && !gameWin) {
    gameWin = true;
    bgm.pause();
    bgm.currentTime = 0;
    window.location.href = "victory.html";
  }
}

function endGameOver() {
  if (!gameOver) {
    gameOver = true;
    bgm.pause();
    bgm.currentTime = 0;
    window.location.href = "gameover.html";
  }
}

// ---------------- 平台 ----------------
const platforms = [
  new Platform(0, 280, 400, 20, "./assets/terrain/ground.png"),
  new Platform(500, 180, 150, 20, "./assets/terrain/ground.png"),
  new Platform(700, 180, 150, 20, "./assets/terrain/ground.png"),
  new Platform(950, 280, 200, 20, "./assets/terrain/ground.png"),
  new Platform(1200, 160, 180, 20, "./assets/terrain/ground.png"),
  new Platform(1500, 230, 200, 20, "./assets/terrain/ground.png"),
  new Platform(1800, 150, 220, 20, "./assets/terrain/ground.png"),
  new Platform(2300, 270, 250, 20, "./assets/terrain/ground.png"),
  new Platform(2650, 180, 200, 20, "./assets/terrain/ground.png"),
  new Platform(3000, 240, 180, 20, "./assets/terrain/ground.png"),
  new Platform(3350, 160, 200, 20, "./assets/terrain/ground.png"),
  new Platform(3800, 280, 220, 20, "./assets/terrain/ground.png"),
  new Platform(4150, 150, 180, 20, "./assets/terrain/ground.png"),
  new Platform(4500, 230, 200, 20, "./assets/terrain/ground.png"),
  new Platform(4850, 170, 180, 20, "./assets/terrain/ground.png"),
  new Platform(5300, 260, 220, 20, "./assets/terrain/ground.png"),
  new Platform(5650, 150, 200, 20, "./assets/terrain/ground.png"),
  new Platform(6000, 240, 180, 20, "./assets/terrain/ground.png"),
  new Platform(6350, 160, 200, 20, "./assets/terrain/ground.png"),
  new Platform(6800, 280, 220, 20, "./assets/terrain/ground.png"),
  new Platform(7150, 170, 180, 20, "./assets/terrain/ground.png"),
  new Platform(7500, 250, 200, 20, "./assets/terrain/ground.png"),
  new Platform(7850, 150, 180, 20, "./assets/terrain/ground.png"),
  new Platform(8200, 230, 200, 20, "./assets/terrain/ground.png"),
  new Platform(8550, 180, 200, 20, "./assets/terrain/ground.png"),
  new Platform(8900, 200, 600, 20, "./assets/terrain/ground.png"),
];

// ---------------- 怪物 ----------------
const monsters = [
  new Monster("bocchi2", 400, 300),
  new Monster("bocchi1", 600, 300),
  new Monster("bocchi", 900, 200),
];

// ---------------- 弹窗元素 ----------------
const skipBtn = document.getElementById("skipBtn");
const skipModal = document.getElementById("skipModal");
const resumeBtn = document.getElementById("resumeBtn");
const confirmSkipBtn = document.getElementById("confirmSkipBtn");
const tutorialModal = document.getElementById("tutorialModal");
const startGameBtn = document.getElementById("startGameBtn");

// ---------------- 跳过游戏弹窗逻辑 ----------------
skipBtn.addEventListener("click", () => {
  gamePaused = true;
  skipModal.classList.add("show");
});
resumeBtn.addEventListener("click", () => {
  gamePaused = false;
  skipModal.classList.remove("show");
});
confirmSkipBtn.addEventListener("click", () => {
  window.location.href = "victory.html";
});

// ---------------- 教程弹窗逻辑 ----------------
startGameBtn.addEventListener("click", () => {
  tutorialActive = false;
  gamePaused = false;
  tutorialModal.classList.remove("show");
});

// ---------------- 游戏循环 ----------------
function gameLoop() {
  if (gameOver || gameWin) return;

  // 如果暂停或教程弹窗显示，更新渲染但不执行逻辑
  if (gamePaused || tutorialActive) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.rect(0, 0, 640, 480);
    ctx.clip();

    map.draw(ctx, camera.x);
    for (const p of platforms) p.draw(ctx, camera.x);
    player.draw(ctx, camera.x);
    for (const m of monsters) m.draw(ctx, camera.x);
    hud.draw(ctx, 640, 480);

    ctx.restore();

    requestAnimationFrame(gameLoop);
    return;
  }

  // 正常游戏逻辑
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.update(Input.down, Input.pressed, monsters, platforms, endGameWin);
  player.attackMonsters(monsters, endGameWin);

  if (player.health <= 0) {
    endGameOver();
    return;
  }

  camera.update();

  // 绘制游戏场景
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.rect(0, 0, 640, 480);
  ctx.clip();

  map.draw(ctx, camera.x);
  for (const p of platforms) p.draw(ctx, camera.x);
  player.draw(ctx, camera.x);
  for (const m of monsters) {
    m.update(player, monsters);
    m.draw(ctx, camera.x);
  }
  hud.draw(ctx, 640, 480);

  ctx.restore();

  Input.pressed = {};
  requestAnimationFrame(gameLoop);
}

// ---------------- 启动循环 ----------------
requestAnimationFrame(gameLoop);
