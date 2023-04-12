

export default function create(socket) {
  this.fieldMapTileMap = this.make.tilemap({ key: "field-map" });
  this.fieldMapTileMap.addTilesetImage("GPTRPG", "tiles");
  this.fieldMapTileMap.layers.forEach((_, i) => {
    const layer = this.fieldMapTileMap.createLayer(i, "GPTRPG", 0, 0);
    layer.scale = 3;
  });

  const playerSprite = this.add.sprite(0, 0, "player");
  playerSprite.scale = 3;
  this.cameras.main.startFollow(playerSprite, true);
  this.cameras.main.setFollowOffset(-playerSprite.width, -playerSprite.height);

  const gridEngineConfig = {
    characters: [
      {
        id: "player",
        sprite: playerSprite,
        walkingAnimationMapping: 6,
        startPosition: { x: 3, y: 3 },
      },
    ],
  };

  this.plantLayer = this.fieldMapTileMap.createBlankLayer("plants", "GPTRPG", 0, 0);
  this.plantLayer.scale = 3;

  this.plantLayer = this.add.container();

  this.gridEngine.create(this.fieldMapTileMap, gridEngineConfig);
  
  // Create walkable tiles bridge
  this.gridEngine.setTransition({ x: 10, y: 26 }, 'ground', 'bridge');
  this.gridEngine.setTransition({ x: 10, y: 39 }, 'bridge', 'ground');
  this.gridEngine.setTransition({ x: 11, y: 26 }, 'ground', 'bridge');
  this.gridEngine.setTransition({ x: 11, y: 39 }, 'bridge', 'ground');
  this.gridEngine.setTransition({ x: 9, y: 26 }, 'ground', 'bridge');
  this.gridEngine.setTransition({ x: 9, y: 39 }, 'bridge', 'ground');

  // Listen to events from the server
  socket.addEventListener('message', (event) => {
    const res = JSON.parse(event.data);
    this.gridEngine.moveAndCheckCollision(res.action.direction, this.fieldMapTileMap, socket);
    this.gridEngine.move("player", res.action.direction);
  });

  this.gridEngine.movementStopped().subscribe((stopper) => {
    console.log('movement stopped');
    const playerPosition = this.gridEngine.getPosition('player');
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
  
    console.log('surroundings', surroundings)

    socket.send(
      JSON.stringify({
        type: 'movementStopped',
        charId: stopper.charId,
        surroundings: surroundings
      })
    );
  });
  // EXPOSE TO EXTENSION
  window.__GRID_ENGINE__ = this.gridEngine;
};
