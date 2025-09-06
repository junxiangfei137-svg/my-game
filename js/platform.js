class Platform {
  constructor(x, y, width, height, textureSrc = null) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    // 碰撞宽度等于显示宽度
    this.collisionWidth = width - 50;

    this.texture = null;
    if (textureSrc) {
      this.texture = new Image();
      this.texture.src = textureSrc;
    }
  }

  draw(ctx, cameraX) {
    if (
      this.texture &&
      this.texture.complete &&
      this.texture.naturalWidth > 0
    ) {
      const pattern = ctx.createPattern(this.texture, "repeat");
      ctx.save();
      ctx.translate(-cameraX, 0);
      ctx.fillStyle = pattern;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.restore();
    } else {
      ctx.fillStyle = "black";
      ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);
    }
  }
}
