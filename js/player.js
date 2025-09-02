// player.js
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 64;
    this.height = 64;
    this.vx = 0;
    this.vy = 0;
    this.health = 100;
    this.maxHealth = 100;

    this.grounded = true;
    this.facingRight = true;

    // Sprite sheet
    this.sprite = new Image();
    this.sprite.src = "./assets/player.png";

    // 动作动画表
    this.animations = {
      idle: { row: 0, frames: 1 },
      run: { row: 1, frames: 6 },
      jump: { row: 2, frames: 4 },
      attack: { row: 3, frames: 5 },
    };

    this.currentAction = "idle";
    this.frameIndex = 0;
    this.frameTick = 0;
    this.frameSpeed = 10; // 普通动作的动画速度

    // 攻击状态
    this.isAttacking = false;
    this.attackFrame = 0;
    this.attackFrames = 5;

    // ✅ 新增：攻击帧节奏控制
    this.attackFrameTick = 0;
    this.attackFrameSpeed = 10; // 数字越大攻击越慢

    // 武器系统
    this.weapons = [
      new Weapon("Sword", 10, "./assets/weapons/sword.png"),
      new Weapon("Spear", 15, "./assets/weapons/spear.png"),
    ];
    this.currentWeaponIndex = 0;
    this.currentWeapon = this.weapons[this.currentWeaponIndex];

    // Debug
    this.debug = true;
  }

  attackMonsters(monsters) {
    if (!this.currentWeapon || !this.isAttacking) return;

    if (this.currentWeapon.hitbox && !this.currentWeapon.hasHit) {
      for (const monster of monsters) {
        if (
          !monster.isDead &&
          this.isColliding(this.currentWeapon.hitbox, monster)
        ) {
          monster.takeDamage(this.currentWeapon.damage);
          this.currentWeapon.hasHit = true; // 一次攻击动作只触发一次
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

  update(keys, pressed, monsters) {
    // 攻击输入
    if (pressed["j"] && !this.isAttacking) {
      this.isAttacking = true;
      this.attackFrame = 0;
      this.attackFrameTick = 0;
      this.currentAction = "attack";
      pressed["j"] = false;
    }

    // 攻击状态处理（锁定动作）
    if (this.isAttacking) {
      // 攻击帧推进
      this.attackFrameTick++;
      if (this.attackFrameTick >= this.attackFrameSpeed) {
        this.attackFrameTick = 0;
        this.attackFrame++;

        // 攻击关键帧触发
        if (this.attackFrame === 2 && this.currentWeapon) {
          this.currentWeapon.createHitbox(this);
        }
        if (this.attackFrame === 3 && this.currentWeapon) {
          this.attackMonsters(monsters);
        }
        if (this.attackFrame >= this.attackFrames) {
          this.isAttacking = false;
          if (this.currentWeapon) this.currentWeapon.clearHitbox();
          this.currentAction = this.grounded ? "idle" : "jump";
          this.frameIndex = 0; // 重置普通动画
          this.frameTick = 0;
        }
      }

      // 攻击动画帧推进（同步显示）
      const anim = this.animations["attack"];
      this.frameTick++;
      if (this.frameTick >= this.frameSpeed) {
        this.frameTick = 0;
        this.frameIndex++;
        if (this.frameIndex >= anim.frames) this.frameIndex = 0;
      }

      // 攻击期间直接跳过其他动作
      return;
    }

    // 🔹 非攻击状态才处理移动、跳跃、切换武器
    if (keys["ArrowLeft"] || keys["a"]) {
      this.vx = -2;
      this.facingRight = false;
    } else if (keys["ArrowRight"] || keys["d"]) {
      this.vx = 2;
      this.facingRight = true;
    } else {
      this.vx = 0;
    }

    if ((keys[" "] || keys["w"]) && this.grounded) {
      this.vy = -8;
      this.grounded = false;
    }

    if (pressed["q"]) {
      this.switchWeapon();
      pressed["q"] = false;
    }

    // 重力和位置更新
    this.vy += 0.5;
    this.y += this.vy;
    if (this.y >= 300) {
      this.y = 300;
      this.vy = 0;
      this.grounded = true;
    }
    this.x += this.vx;

    // 更新动画
    if (!this.grounded) this.currentAction = "jump";
    else if (this.vx !== 0) this.currentAction = "run";
    else this.currentAction = "idle";

    this.frameTick++;
    if (this.frameTick >= this.frameSpeed) {
      this.frameTick = 0;
      this.frameIndex++;
      const anim = this.animations[this.currentAction];
      if (this.frameIndex >= anim.frames) this.frameIndex = 0;
    }
  }

  draw(ctx, cameraX) {
    const anim = this.animations[this.currentAction];
    const frameW = this.sprite.width / anim.frames;
    const frameH = this.sprite.height / Object.keys(this.animations).length;

    const sx = this.frameIndex * frameW;
    const sy = anim.row * frameH;

    ctx.save();
    if (!this.facingRight) {
      ctx.scale(-1, 1);
      ctx.drawImage(
        this.sprite,
        sx,
        sy,
        frameW,
        frameH,
        -(this.x - cameraX + this.width),
        this.y,
        this.width,
        this.height
      );
    } else {
      ctx.drawImage(
        this.sprite,
        sx,
        sy,
        frameW,
        frameH,
        this.x - cameraX,
        this.y,
        this.width,
        this.height
      );
    }
    ctx.restore();

    // 绘制武器（只有攻击关键帧才绘制）
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
