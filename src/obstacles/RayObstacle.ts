import {
    Color3,
    Ray,
    RayHelper,
    Scene,
    Vector3,
} from "@babylonjs/core";
import type {SnakeSegment} from "../snake/SnakeSegment.ts";

export class RayObstacle {
    private readonly scene: Scene;
    private readonly ray: Ray;
    private readonly rayHelper: RayHelper;
    private readonly segments: readonly SnakeSegment[];

    constructor(
        scene: Scene,
        segments: readonly SnakeSegment[],
        origin: Vector3,
        direction: Vector3,
        length: number
    ) {
        this.scene = scene;
        this.segments = segments;


        this.ray = new Ray(
            origin,
            direction,
            length
        );

        this.rayHelper = new RayHelper(
            this.ray
        );

        this.rayHelper.show(
            this.scene,
            Color3.Red()
        );

        this.scene.registerBeforeRender(() => {
            this.checkHit();
        });
    }

    private checkHit(): void {
        const result = this.scene.pickWithRay(
            this.ray,
            (mesh) => {
                return this.segments.some(
                    segment => !segment.destroyed &&
                        segment.mesh === mesh
                );
            }
        );

        if (!result?.hit || !result.pickedMesh) {
            return;
        }

        const segment = this.segments.find(
            segment =>
                !segment.destroyed &&
                segment.mesh === result.pickedMesh
        );

        if (!segment) {
            return;
        }

        segment.destroyByObstacle();
    }
}