import Simulation from "./src/simulation";

const canvasId = "game-of-life-canvas";
const width = 64;
const height = 64;
const cellSize = 8;
const gridSize = 1;
const simulation = new Simulation(canvasId, width, height, cellSize, gridSize);