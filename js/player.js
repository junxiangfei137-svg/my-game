class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 128;
    this.height = 128;
    this.vx = 0;
    this.vy = 0;
    this.health = 100;
    this.maxHealth = 100;

    this.grounded = true;
    this.facingRight = true;

    this.jumpCount = 0; // 当前跳跃次数
    this.maxJump = 2; // 最大跳跃次数（允许二段跳）

    // Sprite sheet
    this.sprite = new Image();
    this.sprite.src = "./assets/sprite_sheet.png";

    // 动作动画表
    this.animations = {
      idle: { row: 0, frames: 1 },
      run: { row: 1, frames: 12 },
      jump: { row: 2, frames: 4 },
      attack: { row: 3, frames: 5 },
    };

    this.currentAction = "idle";
    this.frameIndex = 0;
    this.frameTick = 0;
    this.frameSpeed = 3;

    // 攻击状态
    this.isAttacking = false;
    this.attackFrame = 0;
    this.attackFrames = 5;
    this.attackFrameTick = 0;
    this.attackFrameSpeed = 8;

    // 武器系统
    this.weapons = [
      new Weapon("Sword", 20, "./assets/weapons/sword.png"),
      new Weapon("Spear", 30, "./assets/weapons/spear.png"),
    ];
    this.currentWeaponIndex = 0;
    this.currentWeapon = this.weapons[this.currentWeaponIndex];

    this.debug = true;
  }

  attackMonsters(monsters, endGameCallback) {
    if (!this.currentWeapon || !this.isAttacking) return;

    if (this.currentWeapon.hitbox && !this.currentWeapon.hasHit) {
      for (const monster of monsters) {
        if (
          !monster.isDead &&
          this.isColliding(this.currentWeapon.hitbox, monster)
        ) {
          monster.takeDamage(
            this.currentWeapon.damage,
            monsters,
            endGameCallback
          );
          this.currentWeapon.hasHit = true;
          break;
        }
      }
    }
  }

  isColliding(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  switchWeapon() {
    this.currentWeaponIndex =
      (this.currentWeaponIndex + 1) % this.weapons.length;
    this.currentWeapon = this.weapons[this.currentWeaponIndex];
    console.log("切换武器 → " + this.currentWeapon.name);
  }

  update(keys, pressed, monsters, platforms, endGameCallback) {
    // ------------------
    // 攻击输入
    // ------------------
    if (pressed["j"] && !this.isAttacking) {
      this.isAttacking = true;
      this.attackFrame = 0;
      this.attackFrameTick = 0;
      this.currentAction = "attack";
      pressed["j"] = false;
    }

    // ------------------
    // 攻击处理
    // ------------------
    if (this.isAttacking) {
      this.attackFrameTick++;
      if (this.attackFrameTick >= this.attackFrameSpeed) {
        this.attackFrameTick = 0;
        this.attackFrame++;

        if (this.attackFrame === 2 && this.currentWeapon)
          this.currentWeapon.createHitbox(this);
        if (this.attackFrame === 3 && this.currentWeapon)
          this.attackMonsters(monsters, endGameCallback);

        if (this.attackFrame >= this.attackFrames) {
          this.isAttacking = false;
          if (this.currentWeapon) this.currentWeapon.clearHitbox();
          this.currentAction = this.grounded ? "idle" : "jump";
          this.frameIndex = 0;
          this.frameTick = 0;
        }
      }

      const anim = this.animations["attack"];
      this.frameTick++;
      if (this.frameTick >= this.frameSpeed) {
        this.frameTick = 0;
        this.frameIndex = (this.frameIndex + 1) % anim.frames;
      }

      return; // 攻击期间不处理移动和跳跃
    }

    // ------------------
    // 左右移动
    // ------------------
    this.vx = 0;
    if (keys["ArrowLeft"] || keys["a"]) {
      this.vx = -2;
      this.facingRight = false;
    } else if (keys["ArrowRight"] || keys["d"]) {
      this.vx = 2;
      this.facingRight = true;
    }

    // ------------------
    // 重力
    // ------------------
    this.vy += 0.5; // 重力加速度

    // ------------------
    // 预测下一帧位置
    // ------------------
    const nextX = this.x + this.vx;
    const nextY = this.y + this.vy;

    // ------------------
    // 平台碰撞
    // ------------------
    let grounded = false;
    for (const p of platforms) {
      const px = p.x,
        py = p.y,
        pw = p.collisionWidth,
        ph = p.height;
      const overX = nextX + this.width > px && nextX < px + pw;
      const overY = nextY + this.height > py && nextY < py + ph;

      // 从上方落到平台
      if (
        this.vy >= 0 &&
        this.y + this.height <= py &&
        nextY + this.height >= py &&
        overX
      ) {
        this.y = py - this.height;
        this.vy = 0;
        grounded = true;
      }

      // 从下方碰到平台底部
      if (this.vy < 0 && this.y >= py + ph && nextY <= py + ph && overX) {
        this.y = py + ph;
        this.vy = 0;
      }

      // 左右碰撞
      if (overY) {
        if (
          this.vx > 0 &&
          this.x + this.width <= px &&
          nextX + this.width > px
        ) {
          this.x = px - this.width;
          this.vx = 0;
        } else if (this.vx < 0 && this.x >= px + pw && nextX < px + pw) {
          this.x = px + pw;
          this.vx = 0;
        }
      }
    }

    // ------------------
    // 二段跳逻辑
    // ------------------
    if (grounded) this.jumpCount = 0; // 落地重置

    if ((keys[" "] || keys["w"]) && this.jumpCount < this.maxJump) {
      this.vy = -12;
      this.jumpCount++;
      grounded = false; // 离开地面
    }

    // ------------------
    // 更新位置
    // ------------------
    this.x += this.vx;
    this.y += this.vy;
    this.grounded = grounded;

    // ------------------
    // 地面边界
    // ------------------
    const groundY = 400;
    if (this.y + this.height >= groundY) {
      this.y = groundY - this.height;
      this.vy = 0;
      this.grounded = true;
      this.jumpCount = 0;
    }

    // ------------------
    // 切换武器
    // ------------------
    if (pressed["q"]) {
      this.switchWeapon();
      pressed["q"] = false;
    }

    // ------------------
    // 更新动画
    // ------------------
    if (!this.grounded) this.currentAction = "jump";
    else if (this.vx !== 0) this.currentAction = "run";
    else this.currentAction = "idle";

    this.frameTick++;
    if (this.frameTick >= this.frameSpeed) {
      this.frameTick = 0;
      const anim = this.animations[this.currentAction];
      this.frameIndex = (this.frameIndex + 1) % anim.frames;
    }
  }

  draw(ctx, cameraX) {
    const anim = this.animations[this.currentAction];
    const frameW = 1280;
    const frameH = 1280;
    const sx = this.frameIndex * frameW;
    const sy = anim.row * frameH;

    ctx.save();
    // 移动到人物中心，翻转更安全
    ctx.translate(this.x - cameraX + this.width / 2, this.y + this.height / 2);
    ctx.scale(!this.facingRight ? 1 : -1, 1);
    ctx.drawImage(
      this.sprite,
      sx,
      sy,
      frameW,
      frameH,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    ctx.restore();

    if (this.currentWeapon && this.currentWeapon.hitbox) {
      this.currentWeapon.draw(ctx, this, cameraX, this.debug);
    }

    // Debug
    if (this.debug) {
      ctx.fillStyle = "white";
      ctx.font = "14px monospace";
      ctx.fillText(`Action: ${this.currentAction}`, 10, 20);
      ctx.fillText(`Frame: ${this.frameIndex}`, 10, 40);
      ctx.fillText(`AttackFrame: ${this.attackFrame}`, 10, 60);
    }
  }
}
