import "./style.css";

import { Game } from "./core/Game";

const canvas = document.createElement("canvas");
canvas.id = "renderCanvas";

document.body.appendChild(canvas);

const game = new Game(canvas);

await game.init();

game.start();