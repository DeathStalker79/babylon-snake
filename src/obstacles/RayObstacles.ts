import {Vector3} from "@babylonjs/core";

export const RayObstacles = [
    {
        origin: new Vector3(-9, 0.6, 2),
        direction: new Vector3(1, 0, 0),
        length: 8,
    },
    {
        origin: new Vector3(1, 0.6, -2),
        direction: new Vector3(0, 0, 1),
        length: 5,
    },
    {
        origin: new Vector3(-2, 0.6, -4),
        direction: new Vector3(1, 0, 0),
        length: 5,
    },
    {
        origin: new Vector3(5, 0.6, -2),
        direction: new Vector3(0.6, 0, 1),
        length: 7,
    },
] as const;