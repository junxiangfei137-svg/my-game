// weapon.js
class Weapon {
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

    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.width = width;
    this.height = height;

    this.hitbox = null;
    this.hasHit = false; // ✅ 新增：是否已经命中过
  }

  attack(player) {
    const x = player.facingRight
      ? player.x + this.offsetX
      : player.x - this.offsetX - this.width;

    const y = player.y + this.offsetY;

    this.hitbox = { x, y, width: this.width, height: this.height };
    this.hasHit = false; // ✅ 每次攻击开始时重置

    console.log(
      `${player.name || "Player"} 使用 ${this.name} 攻击！ 伤害: ${this.damage}`
    );
  }

  draw(ctx, player, cameraX, debug = false) {
    if (!this.sprite.complete || this.sprite.naturalWidth === 0) return;

    const x = player.facingRight
      ? player.x - cameraX + this.offsetX
      : player.x - cameraX - this.offsetX - this.width;

    const y = player.y + this.offsetY;

    ctx.save();
    if (!player.facingRight) {
      ctx.scale(-1, 1);
      ctx.drawImage(this.sprite, -(x + this.width), y, this.width, this.height);
    } else {
      ctx.drawImage(this.sprite, x, y, this.width, this.height);
    }
    ctx.restore();

    // Debug hitbox
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
