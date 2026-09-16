import {
    Mesh,
    MeshBuilder,
    PhysicsAggregate,
    PhysicsShapeType,
    Scene,
    StandardMaterial,
    Color3,
    Vector3,
} from "@babylonjs/core";

export class SnakeSegment {
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
                width: 2,
                height: 1,
                depth: 1,
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

        this.physics.shape.filterMembershipMask = 2;
        this.physics.shape.filterCollideMask = 1;
    }
}