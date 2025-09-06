const MonsterData = {
  bocchi2: {
    name: "bocchi2",
    maxHealth: 30,
    attackDamage: 3,
    speed: 1.2,
    width: 80,
    height: 80,
    spritePath: "./assets/monsters/bocchi-2.png",
  },
  bocchi1: {
    name: "bocchi1",
    maxHealth: 50,
    attackDamage: 5,
    speed: 0.8,
    width: 80,
    height: 80,
    spritePath: "./assets/monsters/bocchi-1.png",
  },
  bocchi: {
    name: "bocchi",
    maxHealth: 200,
    attackDamage: 15,
    speed: 0.6,
    width: 200,
    height: 200,
    spritePath: "./assets/monsters/bocchi.png",
    isBoss: true,
    summonCooldown: 4000, // 4秒召唤一次
    summonTypes: ["bocchi1", "bocchi2"], // 轮番召唤
    hitboxOffsetX: 20,
    hitboxOffsetY: 20,
    hitboxWidth: 160,
    hitboxHeight: 160,
  },
};
