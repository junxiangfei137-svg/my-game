const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const map = new GameMap();
const player = new Player(100, 300);
const camera = new Camera(player, canvas.width, map.scaledWidth);
const hud = new HUD(player);

// main.js
const Input = {
  down: {}, // 是否按下（连续）
  pressed: {}, // 本帧是否“刚刚按下”（边沿）
};

window.addEventListener("keydown", (e) => {
  if (!Input.down[e.key]) {
    Input.pressed[e.key] = true; // 只在从未按→按下的瞬间置 true
  }
  Input.down[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  Input.down[e.key] = false;
});

//初始化怪物
const monsters = [
  new Monster("slime", 400, 300),
  new Monster("goblin", 600, 300),
  new Monster("orc", 900, 300),
];

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.update(Input.down, Input.pressed, monsters); // ✅ 传入两类输入

  // 玩家攻击怪物
  player.attackMonsters(monsters);

  // ✅ 游戏结束检测
  if (player.health <= 0) {
    window.location.href = "gameover.html";
    return; // 停止继续绘制
  }

  camera.update();
  map.draw(ctx, camera.x);
  player.draw(ctx, camera.x);

  // 怪物逻辑
  for (const monster of monsters) {
    monster.update(player);
    monster.draw(ctx, camera.x);
  }

  hud.draw(ctx, canvas.width, canvas.height);
  // 渲染逻辑...

  // ✅ 本帧结束后清除 pressed 边沿
  Input.pressed = {};

  requestAnimationFrame(gameLoop);
}

gameLoop();
