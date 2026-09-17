import { Scene, Vector3 } from "@babylonjs/core";
import { DustEffect } from "./DustEffect";

export class DustPool {
    private readonly effects: DustEffect[] = [];
    private nextIndex = 0;

    constructor(
        scene: Scene,
        size: number
    ) {
        for (let i = 0; i < size; i++) {
            this.effects.push(
                new DustEffect(scene)
            );
        }
    }

    public emit(
        position: Vector3,
        particleCount: number
    ): void {
        const effect = this.effects[this.nextIndex];

        effect.emit(
            position,
            particleCount
        );

        this.nextIndex =
            (this.nextIndex + 1) %
            this.effects.length;
    }
}