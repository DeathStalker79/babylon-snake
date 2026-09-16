import {
    Physics6DoFConstraint,
    PhysicsConstraintAxis,
    type Scene,
    Vector3
} from "@babylonjs/core";

import { SnakeConfig } from "./SnakeConfig";
import {SnakeSegment} from "./SnakeSegment.ts";


export class Snake {
    private readonly scene: Scene;
    private readonly snakeSegments: SnakeSegment[] = [];

    constructor(scene: Scene) {
        this.scene = scene;
        this.createSnake();
        this.connectSegments();
    }
    private createSnake() {
        const snakeWidth = (SnakeConfig.segmentCount - 1) * SnakeConfig.segmentWidth;
        const startX = -snakeWidth / 2;

        for (let index = 0; index < SnakeConfig.segmentCount; index++) {
            const position = new Vector3(
                startX + index * SnakeConfig.segmentWidth,
                SnakeConfig.startHeight,
                0
            );

            const segment = new SnakeSegment(
                `segment-${index + 1}`,
                position,
                this.scene
            );

            this.snakeSegments.push(segment);
        }
    }

    private connectSegments() {
        for (let i = 0; i < this.snakeSegments.length - 1; i++) {
            const constraint = this.createConstraint();
            const first =  this.snakeSegments[i];
            const second = this.snakeSegments[i + 1];

            first.physics.body.addConstraint(
                second.physics.body,
                constraint
            );
        }
    }

    private createConstraint() {
        const halfSegmentWidth = SnakeConfig.segmentWidth / 2;

        return new Physics6DoFConstraint({
                pivotA: new Vector3(halfSegmentWidth, 0, 0),
                pivotB: new Vector3(-halfSegmentWidth, 0, 0),

                axisA: new Vector3(1, 0, 0),
                axisB: new Vector3(1, 0, 0),

                perpAxisA: new Vector3(0, 1, 0),
                perpAxisB: new Vector3(0, 1, 0),
            },
            [
                this.createLockedLimit(PhysicsConstraintAxis.LINEAR_X),
                this.createLockedLimit(PhysicsConstraintAxis.LINEAR_Y),
                this.createLockedLimit(PhysicsConstraintAxis.LINEAR_Z),
                this.createLockedLimit(PhysicsConstraintAxis.ANGULAR_X),
                {
                    axis: PhysicsConstraintAxis.ANGULAR_Y,
                    minLimit: -SnakeConfig.angularLimit,
                    maxLimit: SnakeConfig.angularLimit,
                },
                {
                    axis: PhysicsConstraintAxis.ANGULAR_Z,
                    minLimit: -SnakeConfig.angularLimit,
                    maxLimit: SnakeConfig.angularLimit,
                },
            ],
            this.scene
        );
    }

    private createLockedLimit(axis: PhysicsConstraintAxis) {
        return {
            axis,
            minLimit: 0,
            maxLimit: 0,
        };
    }
}