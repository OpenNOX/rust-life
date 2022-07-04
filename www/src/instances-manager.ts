import { IInstanceDictionary } from "./interfaces";
import Simulation from "./simulation";

export default class InstancesManager {
    private static simulationInstanceRowTemplate =
        <HTMLTemplateElement> document.getElementById("simulation-instance-row-template");

    private instances: IInstanceDictionary = {};
    private instanceIndex: number = 0;

    constructor() {
        const addInstanceButton = <HTMLButtonElement> document.getElementById("add-instance");

        addInstanceButton.addEventListener("click", this.addInstance.bind(this));
    }

    public addInstance(): void {
        const computedStyle = getComputedStyle(document.documentElement);
        const gridColor = computedStyle.getPropertyValue("--panel-background-color");
        const aliveColor = computedStyle.getPropertyValue("--foreground-color");
        const instanceName = `simulation-instance-${this.instanceIndex}`;
        const simulationSize = 96;
        const gridSize = 1;

        // TO DO: Calculate cell size based on available space.
        const cellSize = 4;

        const canvas = document.createElement("canvas");
        const simulation =
            new Simulation(canvas, simulationSize, simulationSize, cellSize, gridSize, gridColor, aliveColor);

        InstancesManager.getSimulationInstancesUList().append(
            this.getSimulationInstanceRow(instanceName, canvas, simulation));
        InstancesManager.getSimulationsWrapper().append(canvas);

        this.instances[instanceName] = simulation;

        this.instanceIndex++;
    }

    private static getSimulationInstancesUList(): HTMLUListElement {
        return <HTMLUListElement> document.getElementById("simulation-instances");
    }

    private static getSimulationsWrapper(): HTMLDivElement {
        return <HTMLDivElement> document.getElementById("simulations-wrapper");
    }

    private getSimulationInstanceRow(
        instanceName: string, canvas: HTMLCanvasElement, simulation: Simulation): HTMLLIElement {
        const simulationInstanceRow =
            <HTMLLIElement> InstancesManager.simulationInstanceRowTemplate.content.cloneNode(true);
        simulationInstanceRow.querySelector(".instance-name").textContent = `Instance #${this.instanceIndex}`;

        const instanceCheckboxLabel = <HTMLLabelElement> simulationInstanceRow.querySelector("label");
        instanceCheckboxLabel.htmlFor = instanceName;

        const instanceCheckbox = <HTMLInputElement> simulationInstanceRow.querySelector('input[type="checkbox"]');
        instanceCheckbox.id = instanceName;

        const playPauseButton = <HTMLButtonElement> simulationInstanceRow.querySelector(".play-pause-instance");
        const stepForwardButton = <HTMLButtonElement> simulationInstanceRow.querySelector(".step-instance-forward");
        const resetButton = <HTMLButtonElement> simulationInstanceRow.querySelector(".reset-instance");
        const clearButton = <HTMLButtonElement> simulationInstanceRow.querySelector(".clear-instance");
        const deleteButton = <HTMLButtonElement> simulationInstanceRow.querySelector(".delete-instance");

        playPauseButton.addEventListener("click", _ => {
            if (simulation.isRunning()) {
                playPauseButton.innerHTML = '<span class="oi" data-glyph="media-pause"></span>';
                stepForwardButton.setAttribute("disabled", "");
                simulation.run(1);
            } else {
                playPauseButton.innerHTML = '<span class="oi" data-glyph="media-play"></span>';
                stepForwardButton.removeAttribute("disabled");
                simulation.pause();
            }
        });

        stepForwardButton.addEventListener("click", _ => {
            simulation.step(1);
        });

        resetButton.addEventListener("click", _ => {
            simulation.reset();
        });

        clearButton.addEventListener("click", _ => {
            simulation.clear();
        });

        deleteButton.addEventListener("click", _ => {
            delete this.instances[instanceName];

            const instanceRow = document.getElementById(instanceName).closest("ul");
            instanceRow.parentNode.removeChild(instanceRow);

            InstancesManager.getSimulationsWrapper().removeChild(canvas);
        });

        return simulationInstanceRow;
    }
}