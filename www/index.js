import UniverseManager from "./src/universe-manager";

const canvasId = "game-of-life-canvas";
const width = 64;
const height = 64;
const universeManager = new UniverseManager(canvasId, width, height);

const playPauseButton = document.getElementById("play-pause");
const stepForwardButton = document.getElementById("step-forward");
const tickStepCountRangeLabel = document.getElementById("tick-step-count-label");
const tickStepCountRange = document.getElementById("tick-step-count");
const resetUniverseButton = document.getElementById("reset-universe");
const clearUniverseButton = document.getElementById("clear-universe");

let animationId = null;
const renderLoop = () => {
    for (let i = 0; i < tickStepCountRange.value; i++) {
        universeManager.universe.tick();
    }

    universeManager.renderUniverse();

    animationId = requestAnimationFrame(renderLoop);
};

const playSimulation = () => {
  playPauseButton.textContent = "⏸︎";
  stepForwardButton.disabled = true;
  renderLoop();
};

const pauseSimulation = () => {
  playPauseButton.textContent = "▶";
  stepForwardButton.disabled = false;
  cancelAnimationFrame(animationId);
  animationId = null;
};
pauseSimulation();

playPauseButton.addEventListener("click", _ => {
    if (animationId === null) {
        playSimulation();
    } else {
        pauseSimulation();
    }
});

stepForwardButton.addEventListener("click", _ => {
    for (let i = 0; i < tickStepCountRange.value; i++) {
        universeManager.universe.tick();
    }

    universeManager.renderUniverse();
});

tickStepCountRange.addEventListener("input", _ => {
    tickStepCountRangeLabel.innerHTML = `<b>Tick Step Count:</b> ${tickStepCountRange.value}`;
});

resetUniverseButton.addEventListener("click", _ => {
    universeManager.universe.initialize_cells();

    universeManager.renderUniverse();
});

clearUniverseButton.addEventListener("click", _ => {
    universeManager.universe.clear_cells();

    universeManager.renderUniverse();
});