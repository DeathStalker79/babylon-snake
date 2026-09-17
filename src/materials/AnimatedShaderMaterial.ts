import {
    Color3,
    Effect,
    Scene,
    ShaderMaterial,
} from "@babylonjs/core";

export class AnimatedShaderMaterial {
    private readonly material: ShaderMaterial;
    private time = 0;

    constructor(
        scene: Scene,
        name: string
    ) {
        Effect.ShadersStore["animatedVertexShader"] = `
            precision highp float;

            attribute vec3 position;

            uniform mat4 worldViewProjection;

            varying vec3 vPosition;

            void main(void) {
                vPosition = position;

                gl_Position =
                    worldViewProjection *
                    vec4(position, 1.0);
            }
        `;

        Effect.ShadersStore["animatedFragmentShader"] = `
            precision highp float;

            varying vec3 vPosition;

            uniform float time;
            uniform vec3 color1;
            uniform vec3 color2;

            void main(void) {
                float wave =
                    sin(vPosition.x * 3.0 + time);

                float factor =
                    wave * 0.5 + 0.5;

                vec3 finalColor =
                    mix(
                        color1,
                        color2,
                        factor
                    );

                gl_FragColor =
                    vec4(finalColor, 1.0);
            }
        `;

        this.material = new ShaderMaterial(
            name,
            scene,
            {
                vertex: "animated",
                fragment: "animated",
            },
            {
                attributes: [
                    "position",
                ],
                uniforms: [
                    "worldViewProjection",
                    "time",
                    "color1",
                    "color2",
                ],
            }
        );

        this.material.setColor3(
            "color1",
            new Color3(1, 0, 0)
        );

        this.material.setColor3(
            "color2",
            new Color3(0, 0, 1)
        );

        scene.onBeforeRenderObservable.add(() => {
            this.time +=
                scene.getEngine().getDeltaTime()
                / 1000;

            this.material.setFloat(
                "time",
                this.time
            );
        });
    }

    public get shaderMaterial(): ShaderMaterial {
        return this.material;
    }

    public setColors(
        color1: Color3,
        color2: Color3
    ): void {
        this.material.setColor3(
            "color1",
            color1
        );

        this.material.setColor3(
            "color2",
            color2
        );
    }
}