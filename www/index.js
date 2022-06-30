import Simulation from "./src/simulation";

const canvasId = "game-of-life-canvas";
const width = 64;
const height = 64;
const simulation = new Simulation(canvasId, width, height);

const playPauseButton = document.getElementById("play-pause");
const stepForwardButton = document.getElementById("step-forward");
const tickStepCountRangeLabel = document.getElementById("tick-step-count-label");
const tickStepCountRange = document.getElementById("tick-step-count");
const resetUniverseButton = document.getElementById("reset-universe");
const clearUniverseButton = document.getElementById("clear-universe");

const playSimulation = () => {
  playPauseButton.textContent = "⏸︎";
  stepForwardButton.disabled = true;
  simulation.run();
};

const pauseSimulation = () => {
  playPauseButton.textContent = "▶";
  stepForwardButton.disabled = false;
  simulation.pause();
};

playPauseButton.addEventListener("click", _ => {
    if (simulation.isRunning()) {
        playSimulation();
    } else {
        pauseSimulation();
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