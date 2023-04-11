import GridEngine from "grid-engine";

class GridEngineExtension extends GridEngine {
  constructor(scene, config) {
    super(scene, config);
  }

  moveAndCheckCollision(direction, fieldMapTileMap, socket) {
    const currentPosition = this.getPosition("player");
    let nextPosition = { ...currentPosition };
  
    switch (direction) {
      case "left":
        nextPosition.x -= 1;
        break;
      case "right":
        nextPosition.x += 1;
        break;
      case "up":
        nextPosition.y -= 1;
        break;
      case "down":
        nextPosition.y += 1;
        break;
      default:
        break;
    }
  
    // Check if the next position has a tile with the 'ge_collide' property set to true
    const collision = fieldMapTileMap.layers.some((layer) => {
      const tile = layer.tilemapLayer.getTileAt(nextPosition.x, nextPosition.y);
      return tile && tile.properties.ge_collide;
    });
  
    if (collision) {
      // console.log('ruh roh')
      socket.send(JSON.stringify({ type: 'movementStopped', charId: 1, surroundings: {} }));
      // Request the next action from the server here
    } else {
      this.move("player", direction);
    }
  }
}

export default GridEngineExtension;