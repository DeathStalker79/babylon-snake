import {
    Mesh,
    MeshBuilder,
    PhysicsAggregate,
    PhysicsShapeType,
    PhysicsMotionType,
    PointerDragBehavior,
    Scene,
    Color3,
    Vector3,
    type PhysicsBody,
    ActionManager,
    ExecuteCodeAction, StandardMaterial,
} from "@babylonjs/core";

import { CollisionGroup } from "../physics/CollisionGroup";
import { SnakeConfig } from "./SnakeConfig";
import type {FragmentPool} from "../destruction/FragmentPool.ts";
import type {DustPool} from "../effects/DustPool.ts";
import {AnimatedShaderMaterial} from "../materials/AnimatedShaderMaterial.ts";
type DestroyCallback = (segment: SnakeSegment) => void;
type SelectCallback = (segment: SnakeSegment) => void;

export class SnakeSegment {
    private static readonly ZERO_VELOCITY = Vector3.Zero();
    public readonly mesh: Mesh;
    public readonly physics: PhysicsAggregate;
    private readonly groundBody: PhysicsBody;
    private readonly destructionThreshold = SnakeConfig.destructionThreshold;
    private isDestroyed = false;
    private readonly fragmentPool: FragmentPool;
    private readonly onDestroyed: DestroyCallback;
    private readonly dragBehavior: PointerDragBehavior;
    private readonly dustPool: DustPool;
    private readonly onSelected: SelectCallback;
    private readonly animatedMaterial: AnimatedShaderMaterial;

    public get destroyed(): boolean {
        return this.isDestroyed;
    }

    constructor(
        id: string,
        position: Vector3,
        scene: Scene,
        groundBody: PhysicsBody,
        fragmentPool: FragmentPool,
        onDestroyed: DestroyCallback,
        dustPool: DustPool,
        onSelected: SelectCallback
    ) {
        this.groundBody = groundBody;
        this.fragmentPool = fragmentPool;
        this.dustPool = dustPool;
        this.onDestroyed = onDestroyed;
        this.onSelected = onSelected;

        this.mesh = MeshBuilder.CreateBox(
            id,
            {
                width: SnakeConfig.segmentWidth,
                height: SnakeConfig.segmentHeight,
                depth: SnakeConfig.segmentDepth,
            },
            scene
        );

        this.mesh.position.copyFrom(position);
        this.mesh.metadata = {
            id,
        };

        const material = new StandardMaterial(
            `${id}-material`,
            scene
        );

        material.diffuseColor = new Color3(
            Math.random(),
            Math.random(),
            Math.random()
        );
        this.mesh.material = material;

        this.animatedMaterial =
            new AnimatedShaderMaterial(
                scene,
                `${id}-shader`
            );

        this.physics = new PhysicsAggregate(
            this.mesh,
            PhysicsShapeType.BOX,
            {
                mass: 1,
                restitution: 0.2,
                friction: 0.8,
            },
            scene
        );

        this.physics.shape.filterMembershipMask = CollisionGroup.Snake;
        this.physics.shape.filterCollideMask = CollisionGroup.Ground;

        this.dragBehavior = this.createDragBehavior();
        this.mesh.addBehavior(this.dragBehavior);

        this.enableCollisionEvents();

        this.mesh.actionManager =
            new ActionManager(scene);

        this.mesh.actionManager.registerAction(
            new ExecuteCodeAction(
                ActionManager.OnPickTrigger,
                () => {
                    if (this.isDestroyed) {
                        return;
                    }

                    this.onSelected(this);
                }
            )
        );
    }

    private createDragBehavior(): PointerDragBehavior {
        const dragBehavior = new PointerDragBehavior({
            dragPlaneNormal: new Vector3(0, 1, 0),
        });

        dragBehavior.dragDeltaRatio = SnakeConfig.dragDeltaRatio;

        dragBehavior.onDragStartObservable.add(() => {
            this.physics.body.setMotionType(
                PhysicsMotionType.ANIMATED
            );

            this.physics.body.disablePreStep = false;
            this.resetVelocity();
        });

        dragBehavior.onDragObservable.add(() => {
            this.mesh.position.y = SnakeConfig.dragHeight;
            this.resetVelocity();
        });

        dragBehavior.onDragEndObservable.add(() => {
            this.resetVelocity();
            this.physics.body.disablePreStep = true;

            this.physics.body.setMotionType(
                PhysicsMotionType.DYNAMIC
            );
        });

        return dragBehavior;
    }

    private resetVelocity() {
        this.physics.body.setLinearVelocity(SnakeSegment.ZERO_VELOCITY);
        this.physics.body.setAngularVelocity(SnakeSegment.ZERO_VELOCITY);
    }

    private enableCollisionEvents(): void {
        this.physics.body.setCollisionCallbackEnabled(true);

        this.physics.body
            .getCollisionObservable()
            .add((event) => {
                if (
                    event.type !== "COLLISION_STARTED" ||
                    event.collidedAgainst !== this.groundBody
                ) {
                    return;
                }

                const contactPoint = event.point;

                if (contactPoint) {
                    this.dustPool.emit(
                        contactPoint.clone(),
                        15
                    );
                }

                if (this.shouldDestroy(event.impulse)) {
                    this.destroy();
                }
            });
    }

    private shouldDestroy(impulse: number): boolean {
        return impulse >= this.destructionThreshold;
    }

    private destroy(): void {
        if (this.isDestroyed) {
            return;
        }
        this.isDestroyed = true;

        this.dragBehavior.onDragStartObservable.clear();
        this.dragBehavior.onDragObservable.clear();
        this.dragBehavior.onDragEndObservable.clear();
        this.dragBehavior.enabled = false;
        this.physics.body.setCollisionCallbackEnabled(false);

        const position = this.mesh.getAbsolutePosition().clone();

        this.fragmentPool.acquire(position);

        this.dustPool.emit(
            position.clone(),
            50
        );

        this.mesh.setEnabled(false);

        this.onDestroyed(this);
    }

    public destroyByObstacle() {
        this.destroy();
    }

    public setShaderColors(
        color1: Color3,
        color2: Color3
    ): void {
        this.animatedMaterial.setColors(
            color1,
            color2
        );

        this.mesh.material =
            this.animatedMaterial.shaderMaterial;
    }
}