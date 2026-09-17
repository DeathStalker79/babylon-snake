import {
    Mesh,
    MeshBuilder,
    PhysicsAggregate,
    PhysicsShapeType,
    PhysicsMotionType,
    PointerDragBehavior,
    Scene,
    StandardMaterial,
    Color3,
    Vector3,
    type PhysicsBody,
} from "@babylonjs/core";

import { CollisionGroup } from "../physics/CollisionGroup";
import { SnakeConfig } from "./SnakeConfig";
import type {FragmentPool} from "../destruction/FragmentPool.ts";

type DestroyCallback = (segment: SnakeSegment) => void;
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

    public get destroyed(): boolean {
        return this.isDestroyed;
    }

    constructor(
        id: string,
        position: Vector3,
        scene: Scene,
        groundBody: PhysicsBody,
        fragmentPool: FragmentPool,
        onDestroyed: DestroyCallback
    ) {
        this.groundBody = groundBody;
        this.fragmentPool = fragmentPool;
        this.onDestroyed = onDestroyed;
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

        this.enableDragging();

        this.enableCollisionEvents();
    }

    private enableDragging(){
        const dragBehavior = new PointerDragBehavior({
            dragPlaneNormal: new Vector3(0, 1, 0),
        });

        this.mesh.addBehavior(dragBehavior);

        const dragHeight = 0.6;

        dragBehavior.onDragStartObservable.add(() => {
            this.physics.body.setMotionType(
                PhysicsMotionType.ANIMATED
            );

            this.physics.body.disablePreStep = false;
            this.resetVelocity();
        });

        dragBehavior.onDragObservable.add((): void => {
            this.mesh.position.y = dragHeight;
            this.resetVelocity();
        });

        dragBehavior.onDragEndObservable.add(() => {
            this.resetVelocity();
            this.physics.body.disablePreStep = true;

            this.physics.body.setMotionType(
                PhysicsMotionType.DYNAMIC
            );
        });
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
                    event.collidedAgainst !== this.groundBody ||
                    this.isDestroyed
                ) {
                    return;
                }

                // console.log(
                //     this.mesh.metadata.id,
                //     event.impulse
                // );
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

        // console.log(
        //     "destroy position:",
        //     this.mesh.getAbsolutePosition().toString()
        // );

        this.isDestroyed = true;

        const position = this.mesh.getAbsolutePosition().clone();

        this.fragmentPool.acquire(position);

        this.mesh.setEnabled(false);

        this.onDestroyed(this);
    }

    public destroyByObstacle() {
        this.destroy();
    }
}