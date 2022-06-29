import { memory } from "rust-life/rust_life_bg";
import { Universe, Cell } from "rust-life";

const CELL_SIZE_PX = 10;
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

const universe = Universe.new();
const width = universe.width();
const height = universe.height();

const canvas = document.getElementById("game-of-life-canvas");
canvas.height = (CELL_SIZE_PX + 1) * height + 1;
canvas.width = (CELL_SIZE_PX + 1) * width + 1;
const canvasContext = canvas.getContext("2d");

const drawGrid = () => {
    canvasContext.beginPath();
    canvasContext.strokeStyle = GRID_COLOR;

    // Vertical grid lines.
    for (let i = 0; i <= width; i++) {
        canvasContext.moveTo(i * (CELL_SIZE_PX + 1) + 1, 0);
        canvasContext.lineTo(i * (CELL_SIZE_PX + 1) + 1, (CELL_SIZE_PX + 1) * height + 1);
    }

    // Horizontal grid lines.
    for (let i = 0; i <= height; i++) {
        canvasContext.moveTo(0, i * (CELL_SIZE_PX + 1) + 1);
        canvasContext.lineTo((CELL_SIZE_PX + 1) * width + 1, i * (CELL_SIZE_PX + 1) + 1);
    }

    canvasContext.stroke();
};

const getIndex = (row, column) => {
    return row * width + column;
};

const cellIsAlive = (cellIndex, cells) => {
    const byte = Math.floor(cellIndex / 8);
    const mask = 1 << (cellIndex % 8);

    return (cells[byte] & mask) === mask;
}

const drawCells = () => {
    const cellsPtr = universe.cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, width * height / 8);

    canvasContext.beginPath();

    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const index = getIndex(row, col);

            canvasContext.fillStyle = cellIsAlive(index, cells) ? ALIVE_COLOR : DEAD_COLOR;
            canvasContext.fillRect(
                col * (CELL_SIZE_PX + 1) + 1,
                row * (CELL_SIZE_PX + 1) + 1,
                CELL_SIZE_PX,
                CELL_SIZE_PX);
        }
    }

    canvasContext.stroke();
};

const renderLoop = () => {
    universe.tick();

    drawGrid();
    drawCells();

    requestAnimationFrame(renderLoop);
};

drawGrid();
drawCells();

requestAnimationFrame(renderLoop);