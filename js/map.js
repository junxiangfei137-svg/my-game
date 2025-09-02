class GameMap {
  constructor() {
    this.image = new Image();
    this.image.src = "./assets/longmap.png"; // 背景图路径

    this.width = 9600; // 原图宽度
    this.height = 1046; // 原图高度

    this.screenWidth = 640;
    this.screenHeight = 480;

    // 按比例缩放到屏幕高度
    this.scale = this.screenHeight / this.height;
    this.scaledWidth = Math.round(this.width * this.scale);
    this.scaledHeight = this.screenHeight;
  }

  draw(ctx, cameraX) {
    if (!this.image.complete) return;

    ctx.imageSmoothingEnabled = false;

    // 把相机位置对应到原始图片坐标
    const srcX = cameraX / this.scale;
    const srcWidth = this.screenWidth / this.scale;

    ctx.drawImage(
      this.image,
      srcX,
      0,
      srcWidth,
      this.height, // 从原图截取哪一部分
      0,
      0,
      this.screenWidth,
      this.screenHeight // 绘制到屏幕
    );
  }
}
