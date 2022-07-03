export default class PerformanceMonitor {
    private performanceMonitorOutput: HTMLPreElement;

    private measurements: number[];

    private previousFrameTimeStamp: number;

    constructor(performanceMonitorOutputId: string) {
        this.performanceMonitorOutput = <HTMLPreElement> document.getElementById(performanceMonitorOutputId);
        this.measurements = [];
        this.previousFrameTimeStamp = performance.now();
    }

    public render(): void {
        const nowFrameTimeStamp = performance.now();
        const deltaFrameTimeStamp = nowFrameTimeStamp - this.previousFrameTimeStamp;
        const framesPerSecond = 1 / deltaFrameTimeStamp * 1000;
        this.previousFrameTimeStamp = nowFrameTimeStamp;

        this.measurements.push(framesPerSecond);
        if (this.measurements.length > 100) {
            this.measurements.shift();
        }

        let min = Infinity;
        let max = -Infinity;
        let sum = 0;
        for (let i = 0; i < this.measurements.length; i++) {
            let measurement = this.measurements[i];

            min = Math.min(measurement, min);
            max = Math.max(measurement, max);
            sum += measurement;
        }
        let avg = sum / this.measurements.length;

        this.performanceMonitorOutput.textContent = `
Frames Per Second:
          latest = ${Math.round(framesPerSecond)}
min. of last 100 = ${Math.round(min)}
max. of last 100 = ${Math.round(max)}
avg. of last 100 = ${Math.round(avg)}
`.trim();
    }
}