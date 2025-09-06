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

    this.wallSound = new Audio("./assets/music/collision.mp3");
    this.wallSound.volume = 0.8;
    this.wallSound.playbackRate = 1.5;

    // 动作动画表
    this.animations = {
      idle: { row: 0, frames: 1 },
      run: { row: 1, frames: 12 },
      jump: { row: 2, frames: 8 },
      attack: { row: 3, frames: 10 },
    };
    this.jumpSound = new Audio("./assets/music/jump.mp3");
    this.jumpSound.volume = 0.8;
    this.jumpSound.playbackRate = 1.5;

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
    this.attackSound = new Audio("./assets/music/attack.mp3");
    this.attackSound.volume = 0.8; // 音量可调
    this.attackSound.playbackRate = 1.5;

    this.hitSound = new Audio("./assets/music/hit.mp3");
    this.hitSound.volume = 0.8;
    // 武器系统
    this.weapons = [
      new Weapon("Sword", 20, "./assets/weapons/sword.png"),
      new Weapon("Spear", 30, "./assets/weapons/spear.png"),
    ];
    this.currentWeaponIndex = 0;
    this.currentWeapon = this.weapons[this.currentWeaponIndex];

    this.debug = true;
  }

  takeDamage(amount, attacker = null) {
    this.health = Math.max(0, this.health - amount);

    // 播放受击音效
    if (this.hitSound) {
      this.hitSound.currentTime = 0;
      this.hitSound.play().catch(() => {});
    }
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
            endGameCallback,
            this // ← 传入玩家作为攻击者，便于怪物计算击退方向
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
      // 播放攻击音效（不论是否击中）
      if (this.attackSound) {
        this.attackSound.currentTime = 0;
        this.attackSound.play().catch(() => {});
      }
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
        const wallAudio = this.wallSound.cloneNode();
        wallAudio.play().catch(() => {});
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
    // 二段跳逻辑（按键边沿触发）
    // ------------------
    if (grounded) this.jumpCount = 0; // 落地重置

    if ((pressed[" "] || pressed["w"]) && this.jumpCount < this.maxJump) {
      this.vy = -12; // 给向上初速度
      this.jumpCount++; // 跳跃次数增加
      grounded = false; // 离开地面
      pressed[" "] = false; // 防止连发
      pressed["w"] = false;

      // 播放跳跃音效
      if (this.jumpSound) {
        this.jumpSound.currentTime = 0;
        this.jumpSound.play().catch(() => {});
      }
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
    const mapWidth = 9600; // 地图总宽度，按你的设计修改
    if (this.x < 0) this.x = 0; // 左边界
    if (this.x + this.width > mapWidth) this.x = mapWidth - this.width; // 右边界

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
