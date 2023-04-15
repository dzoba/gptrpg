import Phaser from "phaser";

export default function update() {
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
    this.agent.moveAndCheckCollision("left", this.fieldMapTileMap);
  } else if (cursors.right.isDown) {
    this.agent.moveAndCheckCollision("right", this.fieldMapTileMap);
  } else if (cursors.up.isDown) {
    this.agent.moveAndCheckCollision("up", this.fieldMapTileMap);
  } else if (cursors.down.isDown) {
    this.agent.moveAndCheckCollision("down", this.fieldMapTileMap);
  }
  
};