// Camera.js
class Camera {
  constructor(player, mapWidth) {
    this.player = player;
    this.mapWidth = mapWidth;
    this.x = 0; // 左边界
    this.screenWidth = window.innerWidth; // 默认值，会动态调整
  }

  update() {
    // 动态更新相机可视宽度
    this.screenWidth = window.innerWidth / scale; // scale 在 main.js 定义
    const halfScreen = this.screenWidth / 2;
    this.x = this.player.x - halfScreen;

    if (this.x < 0) this.x = 0;
    if (this.x + this.screenWidth > this.mapWidth) {
      this.x = Math.max(this.mapWidth - this.screenWidth, 0);
    }
  }
}
