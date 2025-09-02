// player.js
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 64;
    this.height = 64;
    this.vx = 0;
    this.vy = 0;

    this.grounded = true;
    this.facingRight = true;

    // Sprite sheet
    this.sprite = new Image();
    this.sprite.src = "./assets/player.png";

    // 动作动画表（假设 spriteSheet 每行一个动作）
    this.animations = {
      idle: { row: 0, frames: 1 },
      run: { row: 1, frames: 6 },
      jump: { row: 2, frames: 4 },
      attack: { row: 3, frames: 3 },
    };

    this.currentAction = "idle";
    this.frameIndex = 0;
    this.frameTick = 0;
    this.frameSpeed = 8; // 数字越小动画越快

    // 攻击状态
    this.isAttacking = false;
    this.attackFrame = 0;
    this.attackFrames = 3;

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

  switchWeapon() {
    this.currentWeaponIndex =
      (this.currentWeaponIndex + 1) % this.weapons.length;
    this.currentWeapon = this.weapons[this.currentWeaponIndex];
    console.log("切换武器 → " + this.currentWeapon.name);
  }

  update(keys) {
    // 移动（AD / 方向键）
    if (keys["ArrowLeft"] || keys["a"]) {
      this.vx = -2;
      this.facingRight = false;
    } else if (keys["ArrowRight"] || keys["d"]) {
      this.vx = 2;
      this.facingRight = true;
    } else {
      this.vx = 0;
    }

    // 跳跃
    if ((keys[" "] || keys["w"]) && this.grounded) {
      this.vy = -8;
      this.grounded = false;
    }

    // 重力
    this.vy += 0.5;
    this.y += this.vy;
    if (this.y >= 300) {
      this.y = 300;
      this.vy = 0;
      this.grounded = true;
    }

    // 移动更新
    this.x += this.vx;

    // 攻击
    if (keys["j"] && !this.isAttacking) {
      this.isAttacking = true;
      this.attackFrame = 0;
      this.currentAction = "attack";
      if (this.currentWeapon) this.currentWeapon.attack(this);
    }

    // 切换武器（Q键）
    if (keys["q"]) {
      this.switchWeapon();
      keys["q"] = false; // 防止长按快速切换
    }

    // --------------------------
    // 状态机：决定 currentAction
    // --------------------------
    if (this.isAttacking) {
      // 攻击时不打断动画
      this.attackFrame++;
      if (this.attackFrame >= this.attackFrames) {
        this.isAttacking = false;
        this.currentAction = this.grounded ? "idle" : "jump";
      }
    } else if (!this.grounded) {
      this.currentAction = "jump";
    } else if (this.vx !== 0) {
      this.currentAction = "run";
    } else {
      this.currentAction = "idle";
    }

    // 动画帧推进
    this.frameTick++;
    if (this.frameTick >= this.frameSpeed) {
      this.frameTick = 0;
      this.frameIndex++;
      if (this.frameIndex >= this.animations[this.currentAction].frames) {
        this.frameIndex = 0;
      }
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
        frameH, // 裁切
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
        frameH, // 裁切
        this.x - cameraX,
        this.y,
        this.width,
        this.height
      );
    }
    ctx.restore();

    // 绘制武器（攻击时闪现）
    if (this.currentWeapon && this.isAttacking) {
      if (this.attackFrame >= 1 && this.attackFrame <= 2) {
        this.currentWeapon.draw(ctx, this, cameraX, this.debug);
      }
    }

    // Debug 信息
    if (this.debug) {
      ctx.fillStyle = "white";
      ctx.font = "14px monospace";
      ctx.fillText(`Action: ${this.currentAction}`, 10, 20);
      ctx.fillText(`Frame: ${this.frameIndex}`, 10, 40);
      ctx.fillText(`AttackFrame: ${this.attackFrame}`, 10, 60);
      ctx.fillText(
        `Pos: (${Math.floor(this.x)}, ${Math.floor(this.y)})`,
        10,
        80
      );
      ctx.fillText(
        `Vel: (${this.vx.toFixed(2)}, ${this.vy.toFixed(2)})`,
        10,
        100
      );
      ctx.fillText(`Facing: ${this.facingRight ? "Right" : "Left"}`, 10, 120);
      ctx.fillText(`Grounded: ${this.grounded}`, 10, 140);
      if (this.currentWeapon) {
        ctx.fillText(
          `Weapon: ${this.currentWeapon.name} (DMG:${this.currentWeapon.damage})`,
          10,
          160
        );
      }
    }
  }
}
