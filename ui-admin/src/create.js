

export default function create(agent) {
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
        sleepiness: 0,
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

  agent.setGridEngine(this.gridEngine, this.fieldMapTileMap);

  // EXPOSE TO EXTENSION
  window.__GRID_ENGINE__ = this.gridEngine;
};
