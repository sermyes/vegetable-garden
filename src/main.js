import { Game } from './game.js';
import { loading } from './loading.js';

const game = new Game();

loading();

window.onload = () => {
  game.start();
};
