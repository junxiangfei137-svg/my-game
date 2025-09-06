class Camera {
  constructor(player, map, screenWidth) {
    this.player = player;
    this.map = map; // 原图单位
    this.screenWidth = screenWidth; // 原始屏幕宽度 640
    this.x = 0;
  }

  update() {
    const halfScreen = this.screenWidth / 2;
    this.x = this.player.x - halfScreen;

    // 限制摄像机在地图范围内
    if (this.x < 0) this.x = 0;
    if (this.x + this.screenWidth > this.map.width) {
      this.x = this.map.width - this.screenWidth;
    }
  }
}
