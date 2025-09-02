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
    this.hasHit = false; // ✅ 攻击期间是否命中过
  }

  /** ✅ 在关键攻击帧调用，生成一次 hitbox */
  createHitbox(player) {
    // 以人物中心为基准
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;

    const x = player.facingRight
      ? centerX + this.offsetX - this.width / 2
      : centerX - this.offsetX - this.width / 2;

    const y = centerY + this.offsetY - this.height / 2;

    this.hitbox = { x, y, width: this.width, height: this.height };
    this.hasHit = false; // 每次攻击重置
  }

  /** ✅ 攻击帧结束时清除 hitbox */
  clearHitbox() {
    this.hitbox = null;
  }

  draw(ctx, player, cameraX, debug = false) {
    if (!this.hitbox) return;

    const x = this.hitbox.x - cameraX;
    const y = this.hitbox.y;

    if (this.sprite.complete && this.sprite.naturalWidth > 0) {
      ctx.save();
      if (!player.facingRight) {
        ctx.scale(-1, 1);
        ctx.drawImage(
          this.sprite,
          -(x + this.width),
          y,
          this.width,
          this.height
        );
      } else {
        ctx.drawImage(this.sprite, x, y, this.width, this.height);
      }
      ctx.restore();
    }

    if (debug) {
      ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
      ctx.fillRect(x, y, this.width, this.height);
      ctx.strokeStyle = "lime";
      ctx.strokeRect(x, y, this.width, this.height);
    }
  }
}
