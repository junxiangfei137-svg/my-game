const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const map = new GameMap();
const player = new Player(100, 200);
const camera = new Camera(player, map.scaledWidth); // 不再传 canvas.width

const hud = new HUD(player);

// 背景音乐
const bgm = new Audio("./assets/music/bgm.mp3");
bgm.loop = true;
bgm.volume = 0.1;

// 用户交互触发播放（浏览器要求）
function startBGM() {
  bgm.play().catch((err) => console.log("BGM播放被阻止", err));
}
window.addEventListener("click", startBGM, { once: true });
window.addEventListener("keydown", startBGM, { once: true });

let scale = 1;
let offsetX = 0,
  offsetY = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const scaleX = canvas.width / 640; // 原始宽度
  const scaleY = canvas.height / 480; // 原始高度
  scale = Math.min(scaleX, scaleY);

  // 计算居中偏移
  offsetX = (canvas.width - 640 * scale) / 2;
  offsetY = (canvas.height - 480 * scale) / 2;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const Input = { down: {}, pressed: {} };
window.addEventListener("keydown", (e) => {
  if (!Input.down[e.key]) Input.pressed[e.key] = true;
  Input.down[e.key] = true;
});
window.addEventListener("keyup", (e) => {
  Input.down[e.key] = false;
});

// 游戏状态
let gameOver = false;
let gameWin = false;

// 胜利回调
function endGameWin() {
  if (!gameOver && !gameWin) {
    gameWin = true;
    bgm.pause();
    bgm.currentTime = 0;
    window.location.href = "victory.html";
  }
}

// 游戏失败回调
function endGameOver() {
  if (!gameOver) {
    gameOver = true;
    bgm.pause();
    bgm.currentTime = 0;
    window.location.href = "gameover.html";
  }
}

// main.js 添加平台
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

// 初始化怪物
const monsters = [
  new Monster("bocchi2", 400, 300),
  new Monster("bocchi1", 600, 300),
  new Monster("bocchi", 900, 200),
];

// ---------- 游戏循环 ----------
function gameLoop() {
  if (gameOver || gameWin) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.update(Input.down, Input.pressed, monsters, platforms, endGameWin);
  player.attackMonsters(monsters, endGameWin);

  if (player.health <= 0) {
    endGameOver();
    return;
  }

  camera.update();

  // ========= 绘制部分 =========
  ctx.save();

  // 应用偏移和缩放，让游戏画面居中
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  // 限制绘制区域在 640×480 内
  ctx.beginPath();
  ctx.rect(0, 0, 640, 480);
  ctx.clip();

  // 绘制地图、平台、角色、怪物
  map.draw(ctx, camera.x);
  for (const p of platforms) p.draw(ctx, camera.x);
  player.draw(ctx, camera.x);
  for (const monster of monsters) {
    monster.update(player, monsters);
    monster.draw(ctx, camera.x);
  }

  // 绘制 HUD
  hud.draw(ctx, 640, 480);

  ctx.restore();
  // ========= 绘制结束 =========

  Input.pressed = {};
  requestAnimationFrame(gameLoop);
}

gameLoop();
