import React, { useEffect, useRef } from "react";
import Phaser from 'phaser';
import './App.css';
import GridEngineExtension from "./GridEngineExtension";

import tileset from "./assets/v2.png"
import mapJson from "./assets/GPTRPGMap.json"
import characters from "./assets/characters.png"

const socket = new WebSocket('ws://localhost:8080');

const preload = function () {
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

const create = function () {
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

const update = function () {
  const cursors = this.input.keyboard.createCursorKeys();

  const addPlantKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  const removePlantKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  const randomDestinationKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

  if(randomDestinationKey.isDown) {
    this.gridEngine.moveTo("player", { x: 15, y: 18 });
  }

  if (addPlantKey.isDown) {
    const playerPosition = this.gridEngine.getPosition("player");
    const tileX = playerPosition.x;
    const tileY = playerPosition.y;

    // Get the grass layer
    const grassLayer = this.fieldMapTileMap.layers[0].tilemapLayer;

    // Check if there's a grass tile at the character's position and it has the property 'plantable'
    const grassTile = grassLayer.getTileAt(tileX, tileY);

    if (grassTile && grassTile.properties.plantable) {
      // Check if there's no tile at the character's position in other layers
      const noOtherTile = this.fieldMapTileMap.layers.every((layer, index) => {
        if (index === 0) return true; // Skip the grass layer
        return !layer.tilemapLayer.hasTileAt(tileX, tileY);
      });

      if (noOtherTile) {
        const { x: worldX, y: worldY } = this.fieldMapTileMap.tileToWorldXY(tileX, tileY);

        const plant = this.add.sprite(worldX, worldY, "plant");

        plant.setFrame(446);
        plant.setOrigin(0, 0);
        plant.scale = 3;
        this.plantLayer.add(plant);
      }
    }
  }

  if (removePlantKey.isDown) {
    const playerPosition = this.gridEngine.getPosition("player");
    const { x: worldX, y: worldY } = this.fieldMapTileMap.tileToWorldXY(playerPosition.x, playerPosition.y);

    // Find all overlapping plants
    const plantsToRemove = this.plantLayer.list.filter((plant) => {
      const distance = Phaser.Math.Distance.Between(plant.x, plant.y, worldX, worldY);
      return distance < (16 * 3) / 2;
    });

    // Remove all the overlapping plants
    plantsToRemove.forEach((plant) => {
      plant.destroy();
    });
  }
  
  if (cursors.left.isDown) {
    this.gridEngine.moveAndCheckCollision("left", this.fieldMapTileMap, socket);
  } else if (cursors.right.isDown) {
    this.gridEngine.moveAndCheckCollision("right", this.fieldMapTileMap, socket);
  } else if (cursors.up.isDown) {
    this.gridEngine.moveAndCheckCollision("up", this.fieldMapTileMap, socket);
  } else if (cursors.down.isDown) {
    this.gridEngine.moveAndCheckCollision("down", this.fieldMapTileMap, socket);
  }
  
};

function App() {
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current === null) {
      gameRef.current = new Phaser.Game({
        title: "GridEngineExample",
        render: {
          antialias: false,
        },
        type: Phaser.AUTO,
        physics: {
          default: "arcade",
        },
        plugins: {
          scene: [
            {
              key: "gridEngine",
              plugin: GridEngineExtension,
              mapping: "gridEngine",
            },
          ],
        },
        scene: {
          preload,
          create,
          update,
        },
        scale: {
          width: window.innerWidth,
          height: window.innerHeight,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        parent: "game",
        backgroundColor: "#48C4F8",
      });
    }
  }, []);

  return <div id="game"></div>;
}

export default App;
