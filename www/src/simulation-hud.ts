import Simulation from "./simulation";

export default abstract class SimulationHud {
    /**
     * Register simulation HUD's event listeners.
     * @param simulation Simulation that will be controlled through event listeners.
     */
    public static registerEventListeners(simulation: Simulation) {
        const disabledAttribute = "disabled";

        const playPauseButton = <HTMLButtonElement> document.getElementById("play-pause");
        const stepForwardButton = <HTMLButtonElement> document.getElementById("step-forward");
        const tickStepCountRangeLabel = <HTMLLabelElement> document.getElementById("tick-step-count-label");
        const tickStepCountRange = <HTMLInputElement> document.getElementById("tick-step-count");
        const resetUniverseButton = <HTMLButtonElement> document.getElementById("reset-universe");
        const clearUniverseButton = <HTMLButtonElement> document.getElementById("clear-universe");

        playPauseButton.addEventListener("click", _ => {
            if (simulation.isRunning()) {
                playPauseButton.textContent = "⏸︎";
                stepForwardButton.setAttribute(disabledAttribute, "");
                simulation.run();
            } else {
                playPauseButton.textContent = "▶";
                stepForwardButton.removeAttribute(disabledAttribute);
                simulation.pause();
            }
        });

        stepForwardButton.addEventListener("click", _ => {
            simulation.step();
        });

        tickStepCountRange.addEventListener("input", _ => {
            tickStepCountRangeLabel.innerHTML = `<b>Tick Step Count:</b> ${tickStepCountRange.value}`;
        });

        resetUniverseButton.addEventListener("click", _ => {
            simulation.reset();
        });

        clearUniverseButton.addEventListener("click", _ => {
            simulation.clear();
        });
    }
}