import {
    Mesh,
    MeshBuilder,
    PhysicsAggregate,
    PhysicsMotionType,
    PhysicsShapeType,
    Scene,
    Vector3,
} from "@babylonjs/core";
import {CollisionGroup} from "../physics/CollisionGroup.ts";

export class FragmentGroup {
    private readonly fragments: Mesh[] = [];
    private readonly physics: PhysicsAggregate[] = [];
    private readonly scene: Scene;
    private static readonly ZERO_VELOCITY = Vector3.Zero();
    private static readonly OFFSETS = [
        new Vector3(-0.5, 0.25, 0),
        new Vector3(0.5, 0.25, 0),
        new Vector3(-0.5, -0.25, 0),
        new Vector3(0.5, -0.25, 0),
    ];

    constructor(scene: Scene) {
        this.scene = scene;

        for (let i = 0; i < FragmentGroup.OFFSETS.length; i++) {
            const fragment = MeshBuilder.CreateBox(
                `fragment-${i}`,
                {
                    width: 1,
                    height: 0.5,
                    depth: 1,
                },
                scene
            );

            const aggregate = new PhysicsAggregate(
                fragment,
                PhysicsShapeType.BOX,
                {
                    mass: 0.25,
                    restitution: 0.3,
                    friction: 0.8,
                },
                scene
            );

            aggregate.shape.filterMembershipMask =
                CollisionGroup.Fragment;

            aggregate.shape.filterCollideMask =
                CollisionGroup.Ground;

            fragment.setEnabled(false);

            aggregate.body.setMotionType(
                PhysicsMotionType.STATIC
            );

            this.fragments.push(fragment);
            this.physics.push(aggregate);
        }
    }

    public activate(position: Vector3): void {
        // console.log(
        //     "fragment activate center:",
        //     position.toString()
        // );

        for (let i = 0; i < this.fragments.length; i++) {
            const fragment = this.fragments[i];
            const physics = this.physics[i];

            const fragmentPosition = position.add(FragmentGroup.OFFSETS[i]);

            fragment.setEnabled(true);

            physics.body.setMotionType(
                PhysicsMotionType.ANIMATED
            );

            physics.body.disablePreStep = false;

            fragment.position.copyFrom(fragmentPosition);
            if (fragment.rotationQuaternion) {
                fragment.rotationQuaternion.set(0, 0, 0, 1);
            } else {
                fragment.rotation.set(0, 0, 0);
            }
        }

        this.scene.onAfterPhysicsObservable.addOnce(() => {
            this.applyExplosionImpulse(position);
        });
    }


    private applyExplosionImpulse(center: Vector3): void {
        const impulseStrength = 0.8;

        for (let i = 0; i < this.fragments.length; i++) {
            const fragment = this.fragments[i];
            const physics = this.physics[i];

            physics.body.disablePreStep = true;

            physics.body.setMotionType(
                PhysicsMotionType.DYNAMIC
            );

            physics.body.setLinearVelocity(
                FragmentGroup.ZERO_VELOCITY
            );

            physics.body.setAngularVelocity(
                FragmentGroup.ZERO_VELOCITY
            );

            const direction = fragment.position
                .subtract(center);

            direction.y += 0.3;
            direction.z += i % 2 === 0 ? -0.35 : 0.35;
            direction.normalize();

            const impulse = direction.scale(
                impulseStrength
            );

            physics.body.applyImpulse(
                impulse,
                fragment.getAbsolutePosition()
            );
        }
    }
}