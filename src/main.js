'use strict';

import { CountUp } from '../dist/countUp.min.js';
import { fadeIn, fadeOut } from './fade.js';
import { Field } from './field.js';
import { PopUp } from './popUp.js';
import Rank from './rank.js';
import * as sound from './sound.js';

const startScreen = document.querySelector(".game__startScreen");
const playScreen = document.querySelector(".game__content");
const startBtn = document.querySelector(".start__btn");
const inputId = document.querySelector('.start__user');
const userId = document.querySelector('.user__id');
const userScore = document.querySelector('.user__score');
const userLevel = document.querySelector('.user__level');
const info_timeout = document.querySelector('.info__timeout');
const info_count = document.querySelector('.info__count');

const loadingScreen = document.querySelector('.loading');
const playField = document.querySelector('.play__field');

const scoreUp = new CountUp('user__score', 0, { duration: 0.5, useEasing: false });

const LEVEL = {
    1 : {
        VEGETABLE_COUNT: 5,
        BUG_COUNT: 5,
        TIMEOUT : 10,
    },
    2 : {
        VEGETABLE_COUNT: 5,
        BUG_COUNT: 5,
        TIMEOUT : 10,
    },
    3 : {
        VEGETABLE_COUNT: 5,
        BUG_COUNT: 5,
        TIMEOUT : 10,
    },

}

let start = false;

let timerId;
let removeItemCount;
let remainingTime;
let user = {
    id : null,
    pid : 0,
    score : 0,
    level : 1,
    rank: 100,
};

window.addEventListener('load', () => {
    hideLoading();
})

const field = new Field(LEVEL, user);
const popup = new PopUp(user);
const rank = new Rank();

field.setClickListener(onItemClick);
popup.setClickListener(onPopUpClick);
popup.setPlayTimerListener(setPlayTimer);

startBtn.addEventListener("click", startGame);
scoreUp.start();
function setPlayTimer(){
    playField.style.pointerEvents = 'visible';
    playTimer();
}

function onPopUpClick(state){
    if(state === 'play'){
        goToNextStage();
    }else{
        rank.calc(user);
        showStartScreen(playScreen);
    }
}

function onItemClick(itemType){
    if(itemType === 'vegetable'){
        sound.playVegetable();
        updateCountText();
        updateScoreText();
    }else{
        sound.playBug();
        clearInterval(timerId);
        finishGame(0, 'Game End : Bug Catch !');
    }
}

function startGame() {
    scoreUp.reset();
    showPlayScreen(startScreen);
    userInfoInit();
    init();
}

function init(){
    start = true;
    updateUserInfo();
    updateGameInfo();
    playStanByTimer();
}

function finishGame(result, msg){
    field.stop(false);
    playField.style.pointerEvents = 'none';
    
    setTimeout(() => {
        updateScoreText();
    }, 1000);
    popup.setRemainingTime(remainingTime);

    if(result && user.level !== 3){
        popup.showFinishText(msg, 'next');
    }else if(result && user.level === 3){
        popup.showFinishText(msg, 'final');
    }else{
        popup.showFinishText(msg, 'end');
    }
}


function goToNextStage(){
    init();
}

function playTimer(){
    remainingTime = LEVEL[user.level].TIMEOUT;
    timerId = setInterval(() => {
        if(remainingTime > 0){
            remainingTime--;
            updateTimerText(remainingTime);
        }else{
            clearInterval(timerId);
            finishGame(0, 'Game End : TimeOut !', null);
        }
    }, 1000);
}

function updateScoreText(){
    scoreUp.update(user.score);
}

function updateCountText(){
    removeItemCount++;
    info_count.textContent = LEVEL[user.level].VEGETABLE_COUNT - removeItemCount;
    if(LEVEL[user.level].VEGETABLE_COUNT === removeItemCount){
        clearInterval(timerId);
        finishGame(1, 'Round Clear ~ !');
    }
}

function updateGameInfo(){
    info_count.textContent = LEVEL[user.level].VEGETABLE_COUNT;
    updateTimerText(LEVEL[user.level].TIMEOUT);
    removeItemCount = 0;
    field.init();
}

function updateTimerText(time){
    let min = Math.floor(time / 60);
    let sec = time % 60;
    if(min === 0){
        min = '00';
    }
    if(sec < 10){
        sec = '0' + sec;
    }
    info_timeout.textContent = `${min}:${sec}`;
}

function hideLoading(){
    loading();
    rank.read();
    showStartScreen(loadingScreen);
}

function showPlayScreen(hide) {
  fadeOut(hide);
  
  setTimeout(() => {
    fadeIn(playScreen, 'flex');
  }, 1200);
}

function showStartScreen(hide){
  fadeOut(hide);

  setTimeout(() => {
    fadeIn(startScreen, 'flex');
  }, 1200);
}

function userInfoInit(){
    user.id = null;
    user.pid = 0;
    user.score = 0;
    user.level = 1;
    user.rank = 100;
}

function playStanByTimer(){
    playField.style.pointerEvents = 'none';
    popup.showStanBy();
}

function updateUserInfo(){
    if(user.id === null){
        const pid = new Date().getTime();
        user.id = inputId.value ? inputId.value : `guest${pid%10000}`;
        inputId.value = '';
        user.pid = pid;
        userId.textContent = user.id;
    }
    userScore.textContent = user.score;
    userLevel.textContent = user.level;
}

function loading(){
    const loadingText = document.querySelector('.loading__text');
    const text = loadingText.textContent.split('');
    loadingText.textContent = '';
    let sec = 0;
    let ms = 1;
    for(let i = 0; i < text.length; i++){
        const span = document.createElement('span');
        span.textContent = text[i];
        span.classList.add('loading__char');
        span.style.animationDelay = `${sec}.${ms++}s`;
        
        if(ms >= 9) {
            sec++;
            ms = 1;
        }

        loadingText.appendChild(span);
    }
}
