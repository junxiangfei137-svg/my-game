// monster.js

class Monster {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 50;

    this.maxHealth = 50;
    this.health = 50;
    this.isDead = false;

    // 攻击属性
    this.attackDamage = 5;
    this.attackCooldown = 1000; // 毫秒
    this.lastAttackTime = 0;
  }

  update(player) {
    if (this.isDead) return;

    // 玩家碰撞检测
    const isColliding =
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y;

    // 攻击玩家
    const now = Date.now();
    if (isColliding && now - this.lastAttackTime >= this.attackCooldown) {
      player.takeDamage(this.attackDamage);
      this.lastAttackTime = now;
      console.log(`怪物攻击了玩家！造成 ${this.attackDamage} 点伤害`);
    }
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    if (this.health === 0) {
      this.isDead = true;
      console.log("怪物死亡！");
    }
  }

  draw(ctx, cameraX) {
    if (this.isDead) return;

    // 怪物矩形
    ctx.fillStyle = "purple";
    ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);

    // 血条
    const barWidth = 50;
    const barHeight = 6;
    const barX = this.x - cameraX;
    const barY = this.y - 10;

    ctx.fillStyle = "red";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const hpPercent = Math.max(0, this.health / this.maxHealth);
    ctx.fillStyle = "limegreen";
    ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);

    ctx.strokeStyle = "black";
    ctx.strokeRect(barX, barY, barWidth, barHeight);
  }
}
