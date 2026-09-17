import {
    ArcRotateCamera,
    Engine,
    HavokPlugin,
    HemisphericLight,
    MeshBuilder,
    PhysicsAggregate,
    PhysicsShapeType,
    Scene,
    Vector3,
} from "@babylonjs/core";

import { CollisionGroup } from "../physics/CollisionGroup";
import { Snake } from "../snake/Snake";

import HavokPhysics from "@babylonjs/havok";
import {FragmentPool} from "../destruction/FragmentPool.ts";
import {SnakeConfig} from "../snake/SnakeConfig.ts";

export class Game {
    private readonly engine: Engine;
    private readonly scene: Scene;
    private readonly canvas: HTMLCanvasElement;
    private groundPhysics!: PhysicsAggregate;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);

        window.addEventListener("resize", this.handleResize);
    }

    public async init() {
        this.createCamera();
        this.createLight();

        await this.enablePhysics();

        this.createGround();
        const fragmentPool = new FragmentPool(
            this.scene,
            SnakeConfig.segmentCount
        );
        new Snake(
            this.scene,
            this.groundPhysics.body,
            fragmentPool
        );
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

        ground.metadata = {
            type: "ground",
        };

        this.groundPhysics = new PhysicsAggregate(
            ground,
            PhysicsShapeType.BOX,
            {
                mass: 0,
                restitution: 0.1,
                friction: 0.9,
            },
            this.scene
        );

        this.groundPhysics.shape.filterMembershipMask = CollisionGroup.Ground;
        this.groundPhysics.shape.filterCollideMask =
            CollisionGroup.Snake |
            CollisionGroup.Fragment;
    }

    private readonly handleResize = (): void => {
        this.engine.resize();
    };
}