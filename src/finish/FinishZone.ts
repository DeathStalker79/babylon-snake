import {
    Color3,
    Mesh,
    MeshBuilder,
    Scene,
    StandardMaterial,
    Vector3,
} from "@babylonjs/core";

import type { SnakeSegment } from "../snake/SnakeSegment";

export class FinishZone {
    private readonly mesh: Mesh;
    private readonly segments: readonly SnakeSegment[];
    private isFinished = false;

    constructor(
        scene: Scene,
        segments: readonly SnakeSegment[]
    ) {
        this.segments = segments;

        this.mesh = MeshBuilder.CreateBox(
            "finish-zone",
            {
                width: 3,
                height: 1,
                depth: 3,
            },
            scene
        );

        this.mesh.position = new Vector3(
            0,
            0.5,
            -7
        );

        const material = new StandardMaterial(
            "finish-zone-material",
            scene
        );

        material.diffuseColor = new Color3(
            0,
            1,
            0
        );

        material.alpha = 0.5;

        this.mesh.material = material;

        scene.registerBeforeRender(() => {
            this.checkIntersection();
        });
    }

    private checkIntersection(): void {
        if (this.isFinished) {
            return;
        }

        for (const segment of this.segments) {
            if (
                !segment.destroyed &&
                this.mesh.intersectsMesh(
                    segment.mesh
                )
            ) {
                this.isFinished = true;

                alert("Finish!");

                return;
            }
        }
    }
}