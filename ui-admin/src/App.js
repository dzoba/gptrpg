import React, { useEffect, useRef } from "react";
import Phaser from 'phaser';
import './App.css';
import GridEngineExtension from "./GridEngineExtension";

import tileset from "./assets/v2.png"
import mapJson from "./assets/GPTRPGMap.json"
import characters from "./assets/characters.png"

import preload from './preload';
import create from './create';
import update from './update';

const socket = new WebSocket('ws://localhost:8080');

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
          preload: function() {
            preload.call(this);
          },
          create: function() {
            create.call(this, socket);
          },
          update: function() {
            update.call(this, socket, this.fieldMapTileMap);
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
