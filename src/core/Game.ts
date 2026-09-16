import {
    ArcRotateCamera,
    // BallAndSocketConstraint,
    Engine,
    HavokPlugin,
    HemisphericLight,
    MeshBuilder,
    Physics6DoFConstraint,
    PhysicsAggregate,
    PhysicsConstraintAxis,
    PhysicsShapeType,
    Scene,
    Vector3,
} from "@babylonjs/core";

import HavokPhysics from "@babylonjs/havok";

import { SnakeSegment } from "../snake/SnakeSegment";

export class Game {
    private readonly engine: Engine;
    private readonly scene: Scene;

    private readonly snakeSegments: SnakeSegment[] = [];
    constructor(
        private readonly canvas: HTMLCanvasElement
    ) {
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);

        window.addEventListener("resize", this.handleResize);
    }

    public async init() {
        this.createCamera();
        this.createLight();

        await this.enablePhysics();

        this.createGround();
        this.createSnake();
        this.connectSnake();
    }

    public start() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    private createCamera() {
        const camera = new ArcRotateCamera(
            "camera",
            Math.PI / 2,
            Math.PI / 3,
            10,
            Vector3.Zero(),
            this.scene
        );

        camera.attachControl(this.canvas, true);
    }

    private createLight() {
        const light = new HemisphericLight(
            "light",
            new Vector3(0, 1, 0),
            this.scene
        );

        light.intensity = 0.7;
    }

    private async enablePhysics() {
        const havokInstance = await HavokPhysics();

        const havokPlugin = new HavokPlugin(
            true,
            havokInstance
        );

        this.scene.enablePhysics(
            new Vector3(0, -10, 0),
            havokPlugin
        );
    }

    private createGround() {
        const ground = MeshBuilder.CreateGround(
            "ground",
            {
                width: 20,
                height: 20,
            },
            this.scene
        );

        const groundPhysics = new PhysicsAggregate(
            ground,
            PhysicsShapeType.BOX,
            {
                mass: 0,
                restitution: 0.2,
                friction: 0.9,
            },
            this.scene
        );

        groundPhysics.shape.filterMembershipMask = 1;
        groundPhysics.shape.filterCollideMask = 2;
    }

    private createSnake() {
        const startY = 4;

        const positions = [
            new Vector3(-3, startY, 0),
            new Vector3(-1, startY, 0),
            new Vector3(1, startY, 0),
            new Vector3(3, startY, 0),
        ];

        for (let i = 0; i < positions.length; i++) {
            const segment = new SnakeSegment(
                `segment-${i + 1}`,
                positions[i],
                this.scene
            );

            this.snakeSegments.push(segment);
        }
    }

    private connectSegments(
        first: SnakeSegment,
        second: SnakeSegment
    ): void {
        // оставил для теста вариант с BallAndSocketConstraint

        // const constraint = new BallAndSocketConstraint(
        //     new Vector3(1, 0, 0),
        //     new Vector3(-1, 0, 0),
        //     new Vector3(0, 1, 0),
        //     new Vector3(0, 1, 0),
        //     this.scene
        // );
        const constraint = new Physics6DoFConstraint({
                pivotA: new Vector3(1, 0, 0),
                pivotB: new Vector3(-1, 0, 0),

                axisA: new Vector3(1, 0, 0),
                axisB: new Vector3(1, 0, 0),

                perpAxisA: new Vector3(0, 1, 0),
                perpAxisB: new Vector3(0, 1, 0),
            },
            [
                {
                    axis: PhysicsConstraintAxis.LINEAR_X,
                    minLimit: 0,
                    maxLimit: 0,
                },
                {
                    axis: PhysicsConstraintAxis.LINEAR_Y,
                    minLimit: 0,
                    maxLimit: 0,
                },
                {
                    axis: PhysicsConstraintAxis.LINEAR_Z,
                    minLimit: 0,
                    maxLimit: 0,
                },

                {
                    axis: PhysicsConstraintAxis.ANGULAR_X,
                    minLimit: 0,
                    maxLimit: 0,
                },
                {
                    axis: PhysicsConstraintAxis.ANGULAR_Y,
                    minLimit: -0.2,
                    maxLimit: 0.2,
                },
                {
                    axis: PhysicsConstraintAxis.ANGULAR_Z,
                    minLimit: -0.2,
                    maxLimit: 0.2,
                },
            ],
            this.scene
        );

        first.physics.body.addConstraint(
            second.physics.body,
            constraint
        );
    }

    private connectSnake(): void {
        for (let i = 0; i < this.snakeSegments.length - 1; i++) {
            this.connectSegments(
                this.snakeSegments[i],
                this.snakeSegments[i + 1]
            );
        }
    }

    private readonly handleResize = (): void => {
        this.engine.resize();
    };
}