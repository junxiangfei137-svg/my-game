// ---------- GameMap ----------
class GameMap {
  constructor() {
    this.image = new Image();
    this.image.src = "./assets/longmap.png";

    this.width = 9600; // 原图宽度（像素）
    this.height = 1046; // 原图高度
    this.screenWidth = 640;
    this.screenHeight = 480;

    this.scale = this.screenHeight / this.height; // 缩放比例
    this.scaledWidth = Math.round(this.width * this.scale); // 缩放后的宽度

    this.startX = 0; // 地图起点（原图坐标）
  }

  draw(ctx, cameraX) {
    if (!this.image.complete) return;
    ctx.imageSmoothingEnabled = false;

    // cameraX = 原图坐标
    const srcX = cameraX; // 原图坐标，不再除 scale
    const srcWidth = this.screenWidth; // 原图单位截取宽度

    ctx.drawImage(
      this.image,
      srcX,
      0,
      srcWidth,
      this.height,
      0,
      0,
      this.screenWidth,
      this.screenHeight
    );
  }
}
