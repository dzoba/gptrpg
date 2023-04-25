import { GridEngine } from "grid-engine";

declare global {
    interface Window {
        __GRID_ENGINE__:  GridEngine
    } 
}