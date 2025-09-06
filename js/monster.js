class Monster {
  constructor(type, x, y, master = null) {
    const data = MonsterData[type];
    if (!data) throw new Error(`未知的怪物类型: ${type}`);

    this.type = type;
    this.name = data.name;
    this.maxHealth = data.maxHealth;
    this.health = data.maxHealth;
    this.attackDamage = data.attackDamage;
    this.speed = data.speed;
    this.color = data.color || "gray";

    this.width = data.width || 200;
    this.height = data.height || 200;
    this.x = x;
    this.y = y;

    // -------------------
    // 重力相关
    // -------------------
    this.vy = 0;
    this.grounded = false;

    this.isDead = false;
    this.isBoss = !!data.isBoss;
    this.master = master;

    this.attackCooldown = data.attackCooldown || 1000;
    this.lastAttackTime = 0;

    // -------------------
    // Boss召唤逻辑
    // -------------------
    this.summonCooldown = data.summonCooldown || 5000;
    this.lastSummonTime = 0;
    this.summonTypes = data.summonTypes || [];
    this.nextSummonIndex = 0;
    this.summonedCount = 0; // 累计召唤数量

    // -------------------
    // 碰撞矩形
    // -------------------
    this.hitbox = {
      offsetX: data.hitboxOffsetX || 0,
      offsetY: data.hitboxOffsetY || 0,
      width: data.hitboxWidth || this.width,
      height: data.hitboxHeight || this.height,
    };

    // -------------------
    // 贴图
    // -------------------
    this.sprite = new Image();
    this.sprite.src = data.spritePath || "";
  }

  update(player, monsters, platforms = []) {
    if (this.isDead) return;

    const now = Date.now();

    // -------------------
    // 横向跟踪玩家
    // -------------------
    if (player.x < this.x) this.x -= this.speed;
    else if (player.x > this.x) this.x += this.speed;

    // -------------------
    // 攻击玩家逻辑
    // -------------------
    const isInRange =
      player.x < this.x + this.hitbox.offsetX + this.hitbox.width &&
      player.x + player.width > this.x + this.hitbox.offsetX &&
      player.y < this.y + this.hitbox.offsetY + this.hitbox.height &&
      player.y + player.height > this.y + this.hitbox.offsetY;

    if (isInRange && now - this.lastAttackTime >= this.attackCooldown) {
      player.health = Math.max(0, player.health - this.attackDamage);
      this.lastAttackTime = now;
      console.log(`${this.name} 攻击了玩家！造成 ${this.attackDamage} 点伤害`);
    }

    // -------------------
    // Boss轮番召唤小怪（最多5只累计）
    // -------------------
    if (
      this.isBoss &&
      this.summonTypes.length > 0 &&
      now - this.lastSummonTime >= this.summonCooldown
    ) {
      if (this.summonedCount < 5) {
        const summonType = this.summonTypes[this.nextSummonIndex];
        monsters.push(new Monster(summonType, this.x + 50, this.y, this));
        this.nextSummonIndex =
          (this.nextSummonIndex + 1) % this.summonTypes.length;
        this.lastSummonTime = now;
        this.summonedCount++;
        console.log(
          `${this.name} 召唤了 ${summonType} (${this.summonedCount}/5)`
        );
      }
    }

    // -------------------
    // 重力逻辑
    // -------------------
    this.vy += 0.5; // 重力加速度
    this.y += this.vy;

    // -------------------
    // 平台/地面碰撞
    // -------------------
    this.grounded = false;
    const groundY = 400; // 地面高度
    if (this.y + this.height >= groundY) {
      this.y = groundY - this.height;
      this.vy = 0;
      this.grounded = true;
    }

    // 平台碰撞
    for (const p of platforms) {
      if (
        this.x + this.width > p.x &&
        this.x < p.x + p.width &&
        this.y + this.height >= p.y &&
        this.y + this.height <= p.y + 20 &&
        this.vy >= 0
      ) {
        this.y = p.y - this.height;
        this.vy = 0;
        this.grounded = true;
      }
    }
  }

  takeDamage(amount, monsters, endGameCallback) {
    if (this.isDead) return;
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) {
      this.isDead = true;
      console.log(`${this.name} 被击杀！`);

      if (this.isBoss) {
        // Boss死亡清理召唤物
        for (let m of monsters) if (m.master === this) m.isDead = true;
        if (endGameCallback) endGameCallback();
      }
    }
  }

  draw(ctx, cameraX) {
    if (this.isDead) return;

    if (this.sprite.complete && this.sprite.naturalWidth > 0) {
      ctx.drawImage(
        this.sprite,
        this.x - cameraX,
        this.y,
        this.width,
        this.height
      );
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);
    }

    // 血条
    const hpPercent = this.health / this.maxHealth;
    ctx.fillStyle = "red";
    ctx.fillRect(this.x - cameraX, this.y - 8, this.width, 5);
    ctx.fillStyle = "limegreen";
    ctx.fillRect(this.x - cameraX, this.y - 8, this.width * hpPercent, 5);
  }
}
