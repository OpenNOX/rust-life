import Simulation from "./simulation";

export interface IInstanceDictionary {
    [key: string]: Simulation,
};

export interface IVector2 {
    x: number,
    y: number,
};