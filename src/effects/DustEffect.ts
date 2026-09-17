import {
    Color4,
    ParticleSystem,
    Scene,
    Texture,
    Vector3,
} from "@babylonjs/core";

export class DustEffect {
    private readonly particleSystem: ParticleSystem;

    constructor(scene: Scene) {
        this.particleSystem = new ParticleSystem(
            "dust",
            50,
            scene
        );

        this.particleSystem.particleTexture = new Texture(
            "/assets/textures/dust.jpg",
            scene
        );

        this.particleSystem.emitter = new Vector3(
            0,
            0.1,
            0
        );

        this.particleSystem.minSize = 0.1;
        this.particleSystem.maxSize = 0.3;

        this.particleSystem.minLifeTime = 0.3;
        this.particleSystem.maxLifeTime = 0.8;

        this.particleSystem.minEmitPower = 0.5;
        this.particleSystem.maxEmitPower = 1.2;

        this.particleSystem.direction1 = new Vector3(
            -1,
            1,
            -1
        );

        this.particleSystem.direction2 = new Vector3(
            1,
            1.5,
            1
        );

        this.particleSystem.gravity = new Vector3(
            0,
            -1,
            0
        );

        this.particleSystem.color1 = new Color4(
            0.6,
            0.5,
            0.4,
            1
        );

        this.particleSystem.color2 = new Color4(
            0.4,
            0.35,
            0.3,
            1
        );

        this.particleSystem.colorDead = new Color4(
            0.4,
            0.35,
            0.3,
            0
        );
    }

    public emit(
        position: Vector3,
        particleCount: number
    ): void {
        this.particleSystem.emitter = position;
        this.particleSystem.manualEmitCount = particleCount;
        this.particleSystem.start();
    }
}