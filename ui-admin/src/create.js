import Agent from "./Agent";

export default function create() {
  this.fieldMapTileMap = this.make.tilemap({ key: "field-map" });
  this.fieldMapTileMap.addTilesetImage("GPTRPG", "tiles");
  this.fieldMapTileMap.layers.forEach((_, i) => {
    const layer = this.fieldMapTileMap.createLayer(i, "GPTRPG", 0, 0);
    layer.scale = 3;
  });

  this.plantLayer = this.fieldMapTileMap.createBlankLayer("plants", "GPTRPG", 0, 0);
  this.plantLayer.scale = 3;

  this.plantLayer = this.add.container();

  // START: Add character to grid engine
  const playerSprite = this.add.sprite(0, 0, "player");
  playerSprite.scale = 3;
  playerSprite.setDepth(6);
  this.cameras.main.startFollow(playerSprite, true);
  this.cameras.main.setFollowOffset(-playerSprite.width, -playerSprite.height);

  const agentId = "agent1";

  const gridEngineConfig = {
    characters: [
      {
        id: agentId,
        sprite: playerSprite,
        walkingAnimationMapping: 6,
        startPosition: { x: 7, y: 6 }
      },
    ],
  };
  // END: Add character to grid engine

  this.gridEngine.create(this.fieldMapTileMap, gridEngineConfig);
  
  // START: Create agent
  this.agent = new Agent(this.gridEngine, this.fieldMapTileMap, agentId, {x: 6, y: 5});
  // END: Create agent

  // Create walkable tiles bridge
  this.gridEngine.setTransition({ x: 10, y: 26 }, 'ground', 'bridge');
  this.gridEngine.setTransition({ x: 10, y: 39 }, 'bridge', 'ground');
  this.gridEngine.setTransition({ x: 11, y: 26 }, 'ground', 'bridge');
  this.gridEngine.setTransition({ x: 11, y: 39 }, 'bridge', 'ground');
  this.gridEngine.setTransition({ x: 9, y: 26 }, 'ground', 'bridge');
  this.gridEngine.setTransition({ x: 9, y: 39 }, 'bridge', 'ground');

  // EXPOSE TO EXTENSION
  window.__GRID_ENGINE__ = this.gridEngine;
};
