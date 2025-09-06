// monster.js
class Monster {
  constructor(type, x, y) {
    const data = MonsterData[type];
    if (!data) throw new Error(`未知的怪物类型: ${type}`);

    this.type = type;
    this.name = data.name;
    this.maxHealth = data.maxHealth;
    this.health = data.maxHealth;
    this.attackDamage = data.attackDamage;
    this.speed = data.speed;
    this.color = data.color || "gray";

    this.width = 200;
    this.height = 200;
    this.x = x;
    this.y = y;

    this.isDead = false;
    this.attackCooldown = 1000; // 毫秒
    this.lastAttackTime = 0;

    // ✅ 加载贴图
    this.sprite = new Image();
    this.sprite.src = data.spritePath || "";
  }

  // 更新怪物逻辑
  update(player) {
    if (this.isDead) return;

    // 简单 AI：横向跟踪玩家
    if (player.x < this.x) {
      this.x -= this.speed;
    } else if (player.x > this.x) {
      this.x += this.speed;
    }

    // 检测与玩家碰撞
    const isInRange =
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y;

    // 攻击逻辑（带冷却）
    const now = Date.now();
    if (isInRange && now - this.lastAttackTime >= this.attackCooldown) {
      player.health = Math.max(0, player.health - this.attackDamage);
      this.lastAttackTime = now;
      console.log(`${this.name} 攻击了玩家！造成 ${this.attackDamage} 点伤害`);
    }
  }

  // 怪物受伤
  takeDamage(amount) {
    if (this.isDead) return;
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) {
      this.isDead = true;
      console.log(`${this.name} 被击杀！`);
    }
  }

  // 绘制怪物和血条
  draw(ctx, cameraX) {
    if (this.isDead) return;

    // 绘制贴图（如果有）
    if (this.sprite.complete && this.sprite.naturalWidth > 0) {
      ctx.drawImage(
        this.sprite,
        this.x - cameraX,
        this.y,
        this.width,
        this.height
      );
    } else {
      // 否则画矩形
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);
    }

    // 绘制血条
    const hpPercent = this.health / this.maxHealth;
    ctx.fillStyle = "red";
    ctx.fillRect(this.x - cameraX, this.y - 8, this.width, 5);
    ctx.fillStyle = "limegreen";
    ctx.fillRect(this.x - cameraX, this.y - 8, this.width * hpPercent, 5);
  }
}
