// hud.js

class HUD {
  constructor(player) {
    this.player = player;
  }

  draw(ctx, canvasWidth, canvasHeight) {
    const hudX = 20;
    const hudY = canvasHeight - 100;
    const boxWidth = 220;
    const boxHeight = 100;

    // HUD 背景框
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(hudX, hudY, boxWidth, boxHeight);

    // ===== 血条部分 =====
    const barX = hudX + 10;
    const barY = hudY + 10;
    const barWidth = 180;
    const barHeight = 20;

    // 血条背景
    ctx.fillStyle = "red";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // 血条当前值
    const healthPercent = Math.max(
      0,
      this.player.health / this.player.maxHealth
    );
    ctx.fillStyle = "limegreen";
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    ctx.fillText(
      `Player: x=${Math.round(this.player.x)}, y=${Math.round(this.player.y)}`,
      10,
      40
    );
    // 血量文字
    ctx.fillStyle = "white";
    ctx.font = "14px monospace";
    ctx.fillText(
      `HP: ${this.player.health}/${this.player.maxHealth}`,
      barX + 60,
      barY + 15
    );

    // ===== 武器部分 =====
    if (
      this.player.currentWeapon &&
      this.player.currentWeapon.sprite.complete
    ) {
      ctx.drawImage(
        this.player.currentWeapon.sprite,
        hudX + 10,
        hudY + 40,
        40,
        40
      );
    }

    ctx.fillStyle = "white";
    ctx.font = "16px monospace";
    if (this.player.currentWeapon) {
      ctx.fillText(
        `${this.player.currentWeapon.name} (DMG:${this.player.currentWeapon.damage})`,
        hudX + 60,
        hudY + 65
      );
    }
  }
}
