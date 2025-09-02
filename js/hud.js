// hud.js

export class HUD {
  constructor(player) {
    this.player = player;
  }

  draw(ctx, canvasWidth, canvasHeight) {
    const hudX = 20;
    const hudY = canvasHeight - 80;
    const boxWidth = 200;
    const boxHeight = 60;

    // 背景框
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(hudX, hudY, boxWidth, boxHeight);

    // 当前武器
    if (
      this.player.currentWeapon &&
      this.player.currentWeapon.sprite.complete
    ) {
      ctx.drawImage(
        this.player.currentWeapon.sprite,
        hudX + 10,
        hudY + 10,
        40,
        40
      );
    }

    // 武器文字
    ctx.fillStyle = "white";
    ctx.font = "16px monospace";
    if (this.player.currentWeapon) {
      ctx.fillText(
        `${this.player.currentWeapon.name} (DMG:${this.player.currentWeapon.damage})`,
        hudX + 60,
        hudY + 35
      );
    }
  }
}
