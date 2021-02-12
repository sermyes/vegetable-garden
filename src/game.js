import { CountUp } from "../dist/countUp.min.js";
import { fadeIn, fadeOut } from "./fade.js";
import { Field, ItemType } from "./field.js";
import { PopUp, Progress } from "./popUp.js";
import Rank from "./rank.js";
import * as sound from "./sound.js";

const Result = Object.freeze({
  clear: true,
  stop: false,
});

const ReasonMsg = Object.freeze({
  clear: "Round Clear ~ !",
  stopTimeout: "Game End : TimeOut !",
  stopBug: "Game End : Bug Catch !",
});

const LEVEL = {
  1: {
    VEGETABLE_COUNT: 10,
    BUG_COUNT: 10,
    TIMEOUT: 30,
  },
  2: {
    VEGETABLE_COUNT: 15,
    BUG_COUNT: 15,
    TIMEOUT: 45,
  },
  3: {
    VEGETABLE_COUNT: 20,
    BUG_COUNT: 20,
    TIMEOUT: 60,
  },
};

export class Game {
  constructor() {
    this.startScreen = document.querySelector(".game__startScreen");
    this.playScreen = document.querySelector(".game__content");
    this.startBtn = document.querySelector(".start__btn");
    this.inputId = document.querySelector(".start__user");
    this.userId = document.querySelector(".user__id");
    this.userScore = document.querySelector(".user__score");
    this.userLevel = document.querySelector(".user__level");
    this.info_timeout = document.querySelector(".info__timeout");
    this.info_count = document.querySelector(".info__count");

    this.loadingScreen = document.querySelector(".loading");
    this.playField = document.querySelector(".play__field");
    this.bgmBtn = document.querySelector('.bgmBtn');
    this.bgm = document.querySelector('.bgm');

    this.started = false;
    this.timerId;
    this.removeItemCount;
    this.remainingTime;
    this.playbgm = false;
    this.user = {
      id: null,
      pid: 0,
      score: 0,
      level: 1,
      rank: 100,
    };

    this.scoreUp = new CountUp("user__score", 0, {
      duration: 0.5,
      useEasing: false,
    });
    this.field = new Field(LEVEL, this.user);
    this.popup = new PopUp(this.user);
    this.rank = new Rank();

    this.scoreUp.start();
    this.field.setClickListener(this.onItemClick);
    this.popup.setClickListener(this.onPopUpClick);
    this.popup.setPlayTimerListener(this.setPlayTimer);
    this.startBtn.addEventListener("click", this.onClick);
    this.bgmBtn.addEventListener('click', this.onBgmClick);
  }

  start() {
    window.addEventListener("load", () => {
      this.hideLoading();
    });
  }

  setPlayTimer = () => {
    sound.playGameBg();
    this.playField.style.pointerEvents = "visible";
    this.playTimer();
  };

  onPopUpClick = (state) => {
    if (state === "play") {
      this.goToNextStage();
    } else {
      this.rank.calc(this.user);
      this.showStartScreen(this.playScreen);
    }
  };

  onItemClick = (itemType) => {
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
    if(this.playbgm === true){
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
    this.field.stop(false);
    this.playField.style.pointerEvents = "none";

    setTimeout(() => {
      this.updateScoreText();
    }, 1000);
    this.popup.setRemainingTime(this.remainingTime);

    if (result && this.user.level !== 3) {
      this.popup.showFinishText(msg, Progress.next);
    } else if (result && this.user.level === 3) {
      this.popup.showFinishText(msg, Progress.final);
    } else {
      this.popup.showFinishText(msg, Progress.stop);
    }
  }

  goToNextStage() {
    fadeOut(this.playScreen);

    setTimeout(() => {
      fadeIn(this.playScreen, "flex");
      this.init();
    }, 1200);
  }

  playTimer() {
    this.remainingTime = LEVEL[this.user.level].TIMEOUT;
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
      LEVEL[this.user.level].VEGETABLE_COUNT - this.removeItemCount;
    if (LEVEL[this.user.level].VEGETABLE_COUNT === this.removeItemCount) {
      clearInterval(this.timerId);
      sound.playWin();
      this.finishGame(Result.clear, ReasonMsg.clear);
    }
  }

  updateGameInfo() {
    this.info_count.textContent = LEVEL[this.user.level].VEGETABLE_COUNT;
    this.updateTimerText(LEVEL[this.user.level].TIMEOUT);
    this.removeItemCount = 0;
    this.field.init();
  }

  updateTimerText(time) {
    let min = Math.floor(time / 60);
    let sec = time % 60;
    if (min === 0) {
      min = "00";
    }
    if (sec < 10) {
      sec = "0" + sec;
    }
    this.info_timeout.textContent = `${min}:${sec}`;
  }

  hideLoading() {
    this.loading();
    this.rank.read();
    this.showStartScreen(this.loadingScreen);
    this.setBgm();
  }

  showPlayScreen(hide) {
    fadeOut(hide);

    setTimeout(() => {
      fadeIn(this.playScreen, "flex");
    }, 1200);
  }

  showStartScreen(hide) {
    fadeOut(hide);

    setTimeout(() => {
      fadeIn(this.startScreen, "flex");
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
    this.playField.style.pointerEvents = "none";
    this.popup.showStanBy();
  }

  updateUserInfo() {
    if (this.user.id === null) {
      const pid = new Date().getTime();
      this.user.id = this.inputId.value
        ? this.inputId.value
        : `guest${pid % 10000}`;
      this.inputId.value = "";
      this.user.pid = pid;
      this.userId.textContent = this.user.id;
    }
    this.userScore.textContent = this.user.score;
    this.userLevel.textContent = this.user.level;
  }

  loading() {
    const loadingText = document.querySelector(".loading__text");
    const text = 'Game Loading...'.split("");
    let sec = 0;
    let ms = 1;
    for (let i = 0; i < text.length; i++) {
      const span = document.createElement("span");
      span.textContent = text[i];
      span.classList.add("loading__char");
      span.style.animationDelay = `${sec}.${ms++}s`;

      if (ms >= 9) {
        sec++;
        ms = 1;
      }

      loadingText.appendChild(span);
    }
  }

  setBgm(){
    const span = document.createElement('span');
    span.classList.add('bgmIco');
    span.classList.add('material-icons');
    span.innerText = 'volume_off';
    span.style.cursor = 'pointer';
    this.bgmBtn.appendChild(span);
  }

  onBgmClick = (e) => {
    if(e.target.textContent === 'volume_off'){
      e.target.parentNode.classList.add('play');
      this.playbgm = true;
      this.playBgm();
      this.changeBgmIco();
    }else if(e.target.textContent === 'volume_up'){
      e.target.parentNode.classList.remove('play');
      this.playbgm = false;
      this.stopBgm();
      this.changeBgmIco();
    }
  }

  changeBgmIco(){
    const bgmIco = document.querySelector('.bgmIco');
    if(bgmIco.textContent === 'volume_off'){
      bgmIco.innerText = 'volume_up';
    }else if(bgmIco.textContent === 'volume_up'){
      bgmIco.innerText = 'volume_off';
    }
  }

  playBgm(){
    this.bgm.play();
  }
  
  stopBgm(){
    this.bgm.pause();
    this.bgm.currentTime = 0;
  }
}
