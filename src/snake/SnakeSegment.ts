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
} from "@babylonjs/core";

import { CollisionGroup } from "../physics/CollisionGroup";
import { SnakeConfig } from "./SnakeConfig";

export class SnakeSegment {
    private static readonly ZERO_VELOCITY = Vector3.Zero();
    public readonly mesh: Mesh;
    public readonly physics: PhysicsAggregate;

    constructor(
        id: string,
        position: Vector3,
        scene: Scene
    ) {
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
}