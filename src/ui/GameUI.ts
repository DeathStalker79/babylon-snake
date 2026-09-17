import {
    AbstractMesh,
    Color3,
    StandardMaterial,
} from "@babylonjs/core";

import {
    AdvancedDynamicTexture,
    Button,
    Control,
    Rectangle,
    StackPanel,
    TextBlock,
} from "@babylonjs/gui";

export class GameUI {
    private readonly selectedText: TextBlock;
    private selectedMesh: AbstractMesh | null = null;
    private readonly finishModal: Rectangle;

    constructor() {
        const ui = AdvancedDynamicTexture.CreateFullscreenUI(
            "game-ui"
        );

        this.finishModal = new Rectangle();

        this.finishModal.width = "320px";
        this.finishModal.height = "200px";
        this.finishModal.cornerRadius = 12;

        this.finishModal.color = "white";
        this.finishModal.thickness = 2;
        this.finishModal.background = "#222222DD";

        this.finishModal.horizontalAlignment =
            Control.HORIZONTAL_ALIGNMENT_CENTER;

        this.finishModal.verticalAlignment =
            Control.VERTICAL_ALIGNMENT_CENTER;

        this.finishModal.isVisible = false;

        const finishPanel = new StackPanel();

        finishPanel.width = "280px";
        finishPanel.isVertical = true;

        this.finishModal.addControl(
            finishPanel
        );

        const finishMessage = new TextBlock();

        finishMessage.text =
            "Поздравляем!\nВы добрались до финиша";

        finishMessage.color = "white";
        finishMessage.fontSize = 20;
        finishMessage.height = "50px";

        finishPanel.addControl(
            finishMessage
        );

        const closeButton =
            Button.CreateSimpleButton(
                "finish-close-button",
                "OK"
            );

        closeButton.width = "120px";
        closeButton.height = "40px";
        closeButton.color = "white";
        closeButton.background = "green";

        closeButton.onPointerClickObservable.add(
            () => {
                this.finishModal.isVisible = false;
            }
        );

        finishPanel.addControl(
            closeButton
        );

        ui.addControl(this.finishModal);

        const panel = new StackPanel();

        panel.width = "220px";
        panel.isVertical = true;

        panel.horizontalAlignment =
            Control.HORIZONTAL_ALIGNMENT_LEFT;

        panel.verticalAlignment =
            Control.VERTICAL_ALIGNMENT_TOP;

        panel.paddingTop = "20px";
        panel.paddingLeft = "20px";

        ui.addControl(panel);

        this.selectedText = new TextBlock();

        this.selectedText.text =
            "Selected: none";

        this.selectedText.height = "40px";
        this.selectedText.color = "white";

        panel.addControl(
            this.selectedText
        );

        const redButton = Button.CreateSimpleButton(
            "red-button",
            "Red"
        );

        redButton.height = "40px";

        redButton.onPointerClickObservable.add(() => {
            this.changeSelectedColor(
                new Color3(1, 0, 0)
            );
        });

        panel.addControl(redButton);

        const blueButton = Button.CreateSimpleButton(
            "blue-button",
            "Blue"
        );

        blueButton.height = "40px";

        blueButton.onPointerClickObservable.add(() => {
            this.changeSelectedColor(
                new Color3(0, 0, 1)
            );
        });

        panel.addControl(blueButton);
    }

    public selectMesh(
        mesh: AbstractMesh
    ): void {
        this.selectedMesh = mesh;

        this.selectedText.text =
            `Selected: ${mesh.metadata?.id ?? "unknown"}`;
    }

    private changeSelectedColor(
        color: Color3
    ): void {
        if (!this.selectedMesh) {
            return;
        }

        const material =
            this.selectedMesh.material;

        if (
            material instanceof StandardMaterial
        ) {
            material.diffuseColor.copyFrom(
                color
            );
        }
    }

    public showFinishMessage() {
        this.finishModal.isVisible = true;
    }
}