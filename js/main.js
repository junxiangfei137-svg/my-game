import { Camera } from "./camera.js";
import { GameMap } from "./map.js";
import { Player } from "./player.js";
import { HUD } from "./hud.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const map = new GameMap();
const player = new Player(100, 300);
const camera = new Camera(player, canvas.width, map.scaledWidth);
const hud = new HUD(player);

const keys = {};
window.addEventListener("keydown", (e) => (keys[e.key] = true));
window.addEventListener("keyup", (e) => (keys[e.key] = false));

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.update(keys);
  camera.update();

  map.draw(ctx, camera.x);
  player.draw(ctx, camera.x);

  // 绘制HUD
  hud.draw(ctx, canvas.width, canvas.height);

  requestAnimationFrame(gameLoop);
}

gameLoop();
