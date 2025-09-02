export class Camera {
  constructor(player, screenWidth, mapWidth) {
    this.player = player;
    this.screenWidth = screenWidth;
    this.mapWidth = mapWidth;
    this.x = 0;
  }

  update() {
    this.x = this.player.x - this.screenWidth / 2;

    if (this.x < 0) this.x = 0;
    if (this.x > this.mapWidth - this.screenWidth) {
      this.x = this.mapWidth - this.screenWidth;
    }
  }
}
