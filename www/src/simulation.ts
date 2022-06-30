import { IVector2 } from "./interfaces";
import { Universe } from "rust-life";
import { memory } from "rust-life/rust_life_bg.wasm";
import SimulationHud from "./simulation-hud";

export default class Simulation {
    /** @readonly Cell size in pixels. */
    private readonly CELL_SIZE: number = 8;

    /** @readonly Color of grid lines. */
    private readonly GRID_COLOR: string = "#CCCCCC";

    /** @readonly Color of cell if alive. */
    private readonly ALIVE_COLOR: string = "#000000";

    /** @readonly Color of cell if dead. */
    private readonly DEAD_COLOR: string = "#FFFFFF";

    /** @private Number of cells universe is high. */
    private height: number;

    /** @private Number of cells universe is wide. */
    private width: number;

    /** @private Rust Universe interface. */
    private universe: Universe;

    /** @private Canvas' 2D rendering context. */
    private canvasContext: CanvasRenderingContext2D;

    /** @private Renderer's animation request ID. */
    private animationId: number = null;

    /**
     * Initializes a new instance of the Simulation class.
     * @param canvasId HTML Canvas element's ID to draw universe on.
     * @param width Number of cells universe is wide.
     * @param height Number of cells universe is high.
     */
    constructor(canvasId: string, width: number, height: number) {
        this.width = width;
        this.height = height;
        this.universe = Universe.new(width, height);

        this.universe.initialize_cells();

        const canvas = <HTMLCanvasElement> document.getElementById(canvasId)
        canvas.height = (this.CELL_SIZE + 1) * height + 1;
        canvas.width = (this.CELL_SIZE + 1) * width + 1;
        this.canvasContext = canvas.getContext("2d");

        this.registerCanvasEventListeners(canvas);
        this.renderUniverse();

        SimulationHud.registerEventListeners(this);
    }

    /**
     * Run the simulation.
     */
    public run(stepTickCount: number): void {
        this.step(stepTickCount);
        this.animationId = requestAnimationFrame(this.run.bind(this, stepTickCount));
    }

    /**
     * Step through the simulation.
     */
    public step(stepTickCount: number): void {
        for (let i = 0; i < stepTickCount; i++) {
            this.universe.tick();
        }

        this.renderUniverse();
    }

    /**
     * Pause the simulation.
     */
    public pause(): void {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
    }

    /**
     * Reset the simulation.
     */
    public reset(): void {
        this.universe.initialize_cells();
        this.renderUniverse();
    }

    /**
     * Clear the simulation's universe of all alive cells.
     */
    public clear(): void {
        this.universe.clear_cells();
        this.renderUniverse();
    }

    public isRunning(): boolean {
        return this.animationId === null;
    }

    /**
     * Draw the universe to the canvas.
     */
    private renderUniverse(): void {
        this.renderGrid();
        this.renderCells();
    }

    /**
     * Draw the universe's grid to the canvas.
     */
    private renderGrid(): void {
        this.canvasContext.beginPath();
        this.canvasContext.strokeStyle = this.GRID_COLOR;

        for (let i = 0; i <= this.width; i++) {
            this.canvasContext.moveTo(i * (this.CELL_SIZE + 1) + 1, 0);
            this.canvasContext.lineTo(i * (this.CELL_SIZE + 1) + 1, (this.CELL_SIZE + 1) * this.height + 1);
        }

        for (let i = 0; i <= this.height; i++) {
            this.canvasContext.moveTo(0, i * (this.CELL_SIZE + 1) + 1);
            this.canvasContext.lineTo((this.CELL_SIZE + 1) * this.width + 1, i * (this.CELL_SIZE + 1) + 1);
        }

        this.canvasContext.stroke();
    }

    /**
     * Draw the universe's state to the canvas.
     */
    private renderCells(): void {
        const cellsPtr = this.universe.get_cells_as_ptr();
        const cells = new Uint8Array(memory.buffer, cellsPtr, this.width * this.height / 8);

        this.canvasContext.beginPath();

        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                const index = this.getCellIndex(row, col);

                this.canvasContext.fillStyle = this.cellIsAlive(index, cells) ? this.ALIVE_COLOR : this.DEAD_COLOR;
                this.canvasContext.fillRect(
                    col * (this.CELL_SIZE + 1) + 1,
                    row * (this.CELL_SIZE + 1) + 1,
                    this.CELL_SIZE,
                    this.CELL_SIZE);
            }
        }

        this.canvasContext.stroke();
    }

    /**
     * Convert cell coordinates into universe's cell index.
     * @param row Y-axis cell coordinate.
     * @param column X-axis cell coordinate.
     * @returns Calculated universe cell index.
     */
    private getCellIndex(row: number, column: number): number {
        return row * this.width + column;
    }

    /**
     * Check if cell is alive.
     * @param cellIndex Universe cell index.
     * @param cells Rust universe cells.
     * @returns True if cell if is alive, otherwise false.
     */
    private cellIsAlive(cellIndex: number, cells: Uint8Array): boolean {
        const byte = Math.floor(cellIndex / 8);
        const mask = 1 << (cellIndex % 8);

        return (cells[byte] & mask) === mask;
    }

    /**
     * Convert mouse coordinates into cell coordinates.
     * @param event Mouse event to convert coordinates for.
     * @returns Calculated cell coordinates.
     */
    private getCellCoordinates(event: MouseEvent): IVector2 {
        const canvas = this.canvasContext.canvas;
        const boundingRect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / boundingRect.width;
        const scaleY = canvas.height / boundingRect.height;

        const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
        const canvasTop = (event.clientY - boundingRect.top) * scaleY;

        return {
            x: Math.min(Math.floor(canvasLeft / (this.CELL_SIZE + 1)), this.width - 1),
            y: Math.min(Math.floor(canvasTop / (this.CELL_SIZE + 1)), this.height - 1),
        };
    }

    /**
     * Register canvas's event listeners.
     * @param canvas Canvas that will have event listeners added to it.
     */
    private registerCanvasEventListeners(canvas: HTMLCanvasElement): void {
        canvas.addEventListener("click", event => {
            const cellCoordinates = this.getCellCoordinates(event);
            const cellIndex = this.getCellIndex(cellCoordinates.y, cellCoordinates.x);

            this.universe.toggle_cell(cellIndex);

            this.renderUniverse();
        });
    }
}