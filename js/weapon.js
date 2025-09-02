// weapon.js

export class Weapon {
  constructor(
    name,
    damage,
    spritePath,
    offsetX = 30,
    offsetY = 10,
    width = 40,
    height = 20
  ) {
    this.name = name;
    this.damage = damage;
    this.sprite = new Image();
    this.sprite.src = spritePath;

    // 绘制偏移（相对人物位置）
    this.offsetX = offsetX;
    this.offsetY = offsetY;

    // hitbox 尺寸（以后可按武器不同调整）
    this.width = width;
    this.height = height;

    // 当前的 hitbox（更新时计算）
    this.hitbox = null;
  }

  attack(player) {
    // 计算 hitbox 的实际位置
    const x = player.facingRight
      ? player.x + this.offsetX
      : player.x - this.offsetX - this.width;

    const y = player.y + this.offsetY;

    this.hitbox = { x, y, width: this.width, height: this.height };

    console.log(
      `${player.name || "Player"} 使用 ${this.name} 攻击！ 伤害: ${this.damage}`
    );
  }

  draw(ctx, player, cameraX, debug = false) {
    if (!this.sprite.complete) return;

    const x = player.facingRight
      ? player.x - cameraX + this.offsetX
      : player.x - cameraX - this.offsetX - this.width; // 注意这里减去武器宽度

    const y = player.y + this.offsetY;

    ctx.save();
    if (!player.facingRight) {
      ctx.scale(-1, 1);
      ctx.drawImage(this.sprite, -(x + this.width), y, this.width, this.height);
    } else {
      ctx.drawImage(this.sprite, x, y, this.width, this.height);
    }
    ctx.restore();

    // Debug 模式下绘制 hitbox（放在最后，不会挡住武器）
    if (debug && this.hitbox) {
      ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
      ctx.fillRect(
        this.hitbox.x - cameraX,
        this.hitbox.y,
        this.hitbox.width,
        this.hitbox.height
      );
      ctx.strokeStyle = "lime";
      ctx.strokeRect(
        this.hitbox.x - cameraX,
        this.hitbox.y,
        this.hitbox.width,
        this.hitbox.height
      );
    }
  }
}
