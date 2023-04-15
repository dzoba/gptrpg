import React, { useEffect, useRef } from "react";
import Phaser from 'phaser';
import './App.css';
import GridEngine from "grid-engine";

import preload from './preload';
import create from './create';
import update from './update';

import Agent from './Agent';
const agent = new Agent();

function App() {
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current === null) {
      gameRef.current = new Phaser.Game({
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
        scene: {
          preload: function() {
            preload.call(this);
          },
          create: function() {
            console.log('gegege', this.gridEngine)
            create.call(this, agent);
          },
          update: function() {
            update.call(this, agent, this.fieldMapTileMap);
          },
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
