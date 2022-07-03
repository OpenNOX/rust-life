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
        const tickStepCountRange = <HTMLInputElement> document.getElementById("tick-step-count-range");
        const resetUniverseButton = <HTMLButtonElement> document.getElementById("reset-universe");
        const clearUniverseButton = <HTMLButtonElement> document.getElementById("clear-universe");
        const inputGroups = document.getElementsByClassName("input-group");

        for (let i = 0; i < inputGroups.length; i++) {
            const range = <HTMLInputElement> inputGroups[i].querySelector("input[type='range']");
            const number = <HTMLInputElement> inputGroups[i].querySelector("input[type='number']");

            range.addEventListener("input", _ => {
                number.value = range.value;
            });

            number.addEventListener("input", _ => {
                range.value = number.value;
            });
        }

        let stepTickCount = parseInt(tickStepCountRange.value);

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

        tickStepCountRange.addEventListener("input", _ => {
            stepTickCount = parseInt(tickStepCountRange.value);
        });

        resetUniverseButton.addEventListener("click", _ => {
            simulation.reset();
        });

        clearUniverseButton.addEventListener("click", _ => {
            simulation.clear();
        });
    }
}