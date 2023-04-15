class Agent {
  constructor(charId = 'player') {
    // this.gridEngine = gridEngine;
    this.charId = charId;
    this.sleepiness = 0;
    
    const socket = new WebSocket('ws://localhost:8080');
    this.socket = socket;

    this.initializeServerListener();    
  }
  
  initializeServerListener() {
    // Listen to events from the server
    this.socket.addEventListener('message', (event) => {
      const res = JSON.parse(event.data);
      console.log('Next action:', res.action.type)
  
      // switch statement on res.action.type
      switch (res.action.type) {
        case 'move':
          this.moveAndCheckCollision(res.action.direction, this.fieldMapTileMap);
          break;
        case 'navigate':
          this.gridEngine.moveTo('player', { x: res.action.x, y: res.action.y });
          break;
        default:
          setTimeout(() => {
            this.nextMove();
          }, 2000);
      }
    });
  }

  initializeMovementStoppedListener() {
    this.gridEngine.movementStopped().subscribe((stopper) => {
      this.nextMove()
    });
  }

  setGridEngine(gridEngine, fieldMapTileMap) {
    this.gridEngine = gridEngine;
    this.fieldMapTileMap = fieldMapTileMap;
    this.initializeMovementStoppedListener();
  }

  getCharacterPosition() {
    return this.gridEngine.getPosition(this.charId);
  }

  getSurroundings() {
    const playerPosition = this.getCharacterPosition();
    const { x: playerX, y: playerY } = playerPosition;
  
    const surroundings = {
      up: 'walkable',
      down: 'walkable',
      left: 'walkable',
      right: 'walkable'
    };
  
    const directions = [
      { key: 'up', dx: 0, dy: -1 },
      { key: 'down', dx: 0, dy: 1 },
      { key: 'left', dx: -1, dy: 0 },
      { key: 'right', dx: 1, dy: 0 }
    ];
  
    this.fieldMapTileMap.layers.forEach((layer) => {
      const tilemapLayer = layer.tilemapLayer;
  
      directions.forEach((direction) => {
        const tile = tilemapLayer.getTileAt(
          playerX + direction.dx,
          playerY + direction.dy
        );
  
        if (tile && tile.properties.ge_collide) {
          surroundings[direction.key] = 'wall';
        }
      });
    });

    return surroundings;
  }

  moveAndCheckCollision(direction, fieldMapTileMap) {
    const currentPosition = this.gridEngine.getPosition("player");
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
      this.nextMove();
    } else {
      this.gridEngine.move("player", direction);
    }
  }

  increaseSleepiness() {
    this.sleepiness = Math.min(this.sleepiness + 0.1, 1);
  }

  nextMove() {
    const characterPosition = this.getCharacterPosition();
    const surroundings = this.getSurroundings();
    this.increaseSleepiness();

    this.socket.send(
      JSON.stringify({
        type: 'requestNextMove',
        charId: this.charId,
        position: characterPosition,
        surroundings: surroundings,
        sleepiness: this.sleepiness
      })
    );
  }
}

export default Agent;
