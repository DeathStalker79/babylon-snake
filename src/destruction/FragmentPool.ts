import { Scene, Vector3 } from "@babylonjs/core";
import { FragmentGroup } from "./FragmentGroup";

export class FragmentPool {
    private readonly groups: FragmentGroup[] = [];
    private nextIndex = 0;

    constructor(scene: Scene, size: number) {
        for (let i = 0; i < size; i++) {
            this.groups.push(
                new FragmentGroup(scene)
            );
        }
    }

    public acquire(position: Vector3): void {
        const group = this.groups[this.nextIndex];

        group.activate(position);

        this.nextIndex =
            (this.nextIndex + 1) % this.groups.length;
    }
}