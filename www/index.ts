import Simulation from "./src/simulation";
import SimulationHud from "./src/simulation-hud";

const computedStyle = getComputedStyle(document.documentElement);

const performanceMonitorOutputId = "performance-monitor-output";

const canvasId = "game-of-life-canvas";
const width = 128;
const height = 128;
const cellSize = 8;
const gridSize = 1;
const gridColor = computedStyle.getPropertyValue("--panel-background-color");
const aliveColor = computedStyle.getPropertyValue("--foreground-color");
const simulation = new Simulation(canvasId, width, height, cellSize, gridSize, gridColor, aliveColor);

SimulationHud.registerEventListeners(simulation);