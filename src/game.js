import { CountUp } from '../dist/countUp.min.js';
import { fadeIn, fadeOut } from './fade.js';
import { Field, ItemType } from './field.js';
import { PopUp, Progress } from './popUp.js';
import Rank from './rank.js';
import * as sound from './sound.js';

const Result = Object.freeze({
  clear: true,
  stop: false
});

const ReasonMsg = Object.freeze({
  clear: 'Round Clear ~ !',
  stopTimeout: 'Game End : TimeOut !',
  stopBug: 'Game End : Bug Catch !'
});

export class GameBuilder {
  _defaultValue = [3];
  _defaultDuration = [5];

  steps(num) {
    if (num < 1) {
      throw new Error('Stage must be 1 or higher');
    }
    this.steps = num;
    return this;
  }

  vegetableCount(...num) {
    this.vegetableCount = num.length >= 1 ? num : this._defaultValue;
    return this;
  }

  bugCount(...num) {
    this.bugCount = num.length >= 1 ? num : this._defaultValue;
    return this;
  }

  duration(...duration) {
    this.duration = duration.length >= 1 ? duration : this._defaultDuration;
    return this;
  }

  build() {
    const stages = {};
    for (let i = 1; i <= this.steps; i++) {
      const vegetableCount = this.vegetableCount[i - 1]
        ? this.vegetableCount[i - 1]
        : this.vegetableCount[0] * i;
      const bugCount = this.bugCount[i - 1]
        ? this.bugCount[i - 1]
        : this.bugCount[0] * i;
      const duration = this.duration[i - 1]
        ? this.duration[i - 1]
        : this.duration[0] * i;

      stages[i] = {
        VEGETABLE_COUNT: vegetableCount,
        BUG_COUNT: bugCount,
        TIMEOUT: duration
      };
    }

    return new Game(stages);
  }
}

export class Game {
  constructor(stages) {
    this.startScreen = document.querySelector('.game__startScreen');
    this.playScreen = document.querySelector('.game__content');
    this.startBtn = document.querySelector('.start__btn');
    this.inputId = document.querySelector('.start__user');
    this.userId = document.querySelector('.user__id');
    this.userScore = document.querySelector('.user__score');
    this.userLevel = document.querySelector('.user__level');
    this.info_timeout = document.querySelector('.info__timeout');
    this.info_count = document.querySelector('.info__count');

    this.loadingScreen = document.querySelector('.loading');
    this.playField = document.querySelector('.play__field');
    this.bgmBtn = document.querySelector('.bgmBtn');
    this.bgm = document.querySelector('.bgm');

    this.stages = stages;
    this.maxStages = Object.keys(stages).length;
    this.started = false;
    this.timerId;
    this.removeItemCount;
    this.remainingTime;
    this.playbgm = false;
    this.user = this._createUser();

    this.scoreUp = new CountUp('user__score', 0, {
      duration: 0.5,
      useEasing: false
    });

    this.field = new Field(this.stages, this.user);
    this.popup = new PopUp(this.user);
    this.rank = new Rank();

    this.scoreUp.start();
    this.field.setClickListener(this.onItemClick);
    this.popup.setClickListener(this.onPopUpClick);
    this.popup.setPlayTimerListener(this.setPlayTimer);
    this.startBtn.addEventListener('click', this.onClick);
    this.bgmBtn.addEventListener('click', this.onBgmClick);
  }

  _createUser() {
    return {
      id: null,
      pid: 0,
      score: 0,
      level: 1,
      rank: 100
    };
  }

  start() {
    this.rank.read();
    this.showStartScreen(this.loadingScreen);
    this.setBgm();
  }

  setPlayTimer = () => {
    sound.playGameBg();
    this.playField.style.pointerEvents = 'visible';
    this.playTimer();
  };

  onPopUpClick = state => {
    if (state === 'play') {
      this.goToNextStage();
    } else {
      this.rank.calc(this.user);
      this.showStartScreen(this.playScreen);
    }
  };

  onItemClick = itemType => {
    if (itemType === ItemType.vegetable) {
      sound.playVegetable();
      this.updateCountText();
      this.updateScoreText();
    } else {
      sound.playBug();
      clearInterval(this.timerId);
      this.finishGame(Result.stop, ReasonMsg.stopBug);
    }
  };

  onClick = () => {
    if (this.playbgm === true) {
      this.stopBgm();
      this.changeBgmIco();
    }

    this.scoreUp.reset();
    this.showPlayScreen(this.startScreen);
    this.userInfoInit();
    this.init();
  };

  init() {
    this.started = true;
    this.updateUserInfo();
    this.updateGameInfo();
    this.playStanByTimer();
  }

  finishGame(result, msg) {
    sound.stopGameBg();
    this.field.stop();
    this.playField.style.pointerEvents = 'none';

    setTimeout(() => {
      this.updateScoreText();
    }, 1000);
    this.popup.setRemainingTime(this.remainingTime);
    if (result && this.user.level < this.maxStages) {
      this.popup.showFinishText(msg, Progress.next);
    } else if (result && this.user.level === this.maxStages) {
      this.popup.showFinishText(msg, Progress.final);
    } else {
      this.popup.showFinishText(msg, Progress.stop);
    }
  }

  goToNextStage() {
    fadeOut(this.playScreen);

    setTimeout(() => {
      fadeIn(this.playScreen, 'flex');
      this.init();
    }, 1200);
  }

  playTimer() {
    this.remainingTime = this.stages[this.user.level].TIMEOUT;
    this.timerId = setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
        this.updateTimerText(this.remainingTime);
      } else {
        sound.playAlert();
        clearInterval(this.timerId);
        this.finishGame(Result.stop, ReasonMsg.stopTimeout);
      }
    }, 1000);
  }

  updateScoreText() {
    this.scoreUp.update(this.user.score);
  }

  updateCountText() {
    this.removeItemCount++;
    this.info_count.textContent =
      this.stages[this.user.level].VEGETABLE_COUNT - this.removeItemCount;
    if (this.stages[this.user.level].VEGETABLE_COUNT === this.removeItemCount) {
      clearInterval(this.timerId);
      sound.playWin();
      this.finishGame(Result.clear, ReasonMsg.clear);
    }
  }

  updateGameInfo() {
    this.info_count.textContent = this.stages[this.user.level].VEGETABLE_COUNT;
    this.updateTimerText(this.stages[this.user.level].TIMEOUT);
    this.removeItemCount = 0;
    this.field.init();
  }

  updateTimerText(time) {
    let min = Math.floor(time / 60);
    let sec = time % 60;
    if (min === 0) {
      min = '00';
    }
    if (sec < 10) {
      sec = '0' + sec;
    }
    this.info_timeout.textContent = `${min}:${sec}`;
  }

  showPlayScreen(hide) {
    fadeOut(hide);

    setTimeout(() => {
      fadeIn(this.playScreen, 'flex');
    }, 1200);
  }

  showStartScreen(hide) {
    fadeOut(hide);

    setTimeout(() => {
      fadeIn(this.startScreen, 'flex');
    }, 1200);
  }

  userInfoInit() {
    this.user.id = null;
    this.user.pid = 0;
    this.user.score = 0;
    this.user.level = 1;
    this.user.rank = 100;
  }

  playStanByTimer() {
    this.playField.style.pointerEvents = 'none';
    this.popup.showStanBy();
  }

  updateUserInfo() {
    if (this.user.id === null) {
      const pid = new Date().getTime();
      this.user.id = this.inputId.value
        ? this.inputId.value
        : `guest${pid % 10000}`;
      this.inputId.value = '';
      this.user.pid = pid;
      this.userId.textContent = this.user.id;
    }
    this.userScore.textContent = this.user.score;
    this.userLevel.textContent = this.user.level;
  }

  setBgm() {
    const span = document.createElement('span');
    span.classList.add('bgmIco');
    span.classList.add('material-icons');
    span.innerText = 'volume_off';
    span.style.cursor = 'pointer';
    this.bgmBtn.appendChild(span);
  }

  onBgmClick = e => {
    if (e.target.textContent === 'volume_off') {
      this.playbgm = true;
      this.playBgm();
      this.changeBgmIco();
    } else if (e.target.textContent === 'volume_up') {
      this.playbgm = false;
      this.stopBgm();
      this.changeBgmIco();
    }
  };

  changeBgmIco() {
    const bgmIco = document.querySelector('.bgmIco');
    if (bgmIco.textContent === 'volume_off') {
      bgmIco.innerText = 'volume_up';
    } else if (bgmIco.textContent === 'volume_up') {
      bgmIco.innerText = 'volume_off';
    }
  }

  playBgm() {
    this.bgm.play();
  }

  stopBgm() {
    this.bgm.pause();
    this.bgm.currentTime = 0;
  }
}
