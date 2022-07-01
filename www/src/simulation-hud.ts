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
        const stepTickCountRange = <HTMLInputElement> document.getElementById("tick-step-count");
        const resetUniverseButton = <HTMLButtonElement> document.getElementById("reset-universe");
        const clearUniverseButton = <HTMLButtonElement> document.getElementById("clear-universe");

        let stepTickCount = parseInt(stepTickCountRange.value);

        playPauseButton.addEventListener("click", _ => {
            if (simulation.isRunning()) {
                playPauseButton.innerHTML = '<span class="oi" data-glyph="media-pause"></span>';
                stepForwardButton.setAttribute(disabledAttribute, "");
                simulation.run(stepTickCount);
            } else {
                playPauseButton.innerHTML = '<span class="oi" data-glyph="media-play"></span>';
                stepForwardButton.removeAttribute(disabledAttribute);
                simulation.pause();
            }
        });

        stepForwardButton.addEventListener("click", _ => {
            simulation.step(stepTickCount);
        });

        stepTickCountRange.addEventListener("input", _ => {
            tickStepCountRangeLabel.innerHTML = `<b>Step Tick Count:</b> ${stepTickCountRange.value}`;

            stepTickCount = parseInt(stepTickCountRange.value);
        });

        resetUniverseButton.addEventListener("click", _ => {
            simulation.reset();
        });

        clearUniverseButton.addEventListener("click", _ => {
            simulation.clear();
        });
    }
}