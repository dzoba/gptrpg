import { GridEngine } from "grid-engine"
import MainScene from "./scenes/main.scene"

const config: Phaser.Types.Core.GameConfig = {
    title: "GPTRPG",
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
          plugin: GridEngine,
          mapping: "gridEngine",
        },
      ],
    },
    scene: [MainScene],
    scale: {
      width: window.innerWidth,
      height: window.innerHeight,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    parent: "game",
    backgroundColor: "#48C4F8",
  }

  export default new Phaser.Game(config)
