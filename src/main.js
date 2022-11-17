import { GameBuilder } from './game.js';
import { loading } from './loading.js';

const game = new GameBuilder()
  .steps(4)
  .vegetableCount()
  .bugCount()
  .duration()
  .build();

loading();

window.onload = () => {
  game.start();
};
