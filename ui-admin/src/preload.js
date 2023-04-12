
import tileset from "./assets/v2.png"
import mapJson from "./assets/GPTRPGMap.json"
import characters from "./assets/characters.png"

export default function preload() {
  this.load.image("tiles", tileset, {
    frameWidth: 16,
    frameHeight: 16,
  });
  this.load.tilemapTiledJSON("field-map", mapJson);
  this.load.spritesheet("player", characters, {
    frameWidth: 26,
    frameHeight: 36,
  });
  
  this.load.spritesheet("plant", tileset, {
    frameWidth: 16,
    frameHeight: 16,
  });
}
