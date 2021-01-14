'use strict';

import { CountUp } from '../dist/countUp.min.js';
import RankRepository from '../service/rank_repository.js';
import { fadeIn, fadeOut } from './fade.js';
import { Field } from './field.js';
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

const popUp = document.querySelector('.pop-up');
const popUp_stanBy = document.querySelector('.pop-up__stanBy');
const popUp_finish = document.querySelector('.pop-up__finish');
const popUp_nextMsg = document.querySelector('.pop-up__nextMsg');
const popUp_finishMsg = document.querySelector('.pop-up__finishMsg');
const popUp_btnIcon = document.querySelector('.fas');
const stanByCounter = document.querySelector('.stanBy__counter');

const rankList = document.querySelector('.rank__list');
const loadingScreen = document.querySelector('.loading');
const playField = document.querySelector('.play__field');

const STANBY_TIME = 5;
const ITEM_SCORE = 100;
const TIME_SCORE = 12;

const scoreUp = new CountUp('user__score', 0, { duration: 0.5, useEasing: false });
const rankRepository = new RankRepository();

const LEVEL = {
    1 : {
        VEGETABLE_COUNT: 10,
        BUG_COUNT: 10,
        TIMEOUT : 30,
    },
    2 : {
        VEGETABLE_COUNT: 15,
        BUG_COUNT: 15,
        TIMEOUT : 45,
    },
    3 : {
        VEGETABLE_COUNT: 20,
        BUG_COUNT: 20,
        TIMEOUT : 60,
    },

}

let start = false;

let stanByTimerId;
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
let rankUser = [];

window.addEventListener('load', () => {
    hideLoading();
})

const field = new Field(LEVEL, user);
popUp_btnIcon.addEventListener('click',onPopUpClick);
startBtn.addEventListener("click", startGame);
scoreUp.start();

field.setClickListener(onItemClick);

function onItemClick(itemType){
    if(itemType === 'vegetable'){
        sound.playVegetable();
        updateCountText();
        updateScoreText(ITEM_SCORE);
    }else{
        sound.playBug();
        clearInterval(timerId);
        finishGame(0, 'Game End : Bug Catch !');
    }
}

function updateRankText(){
    rankList.innerHTML = '';
    let list = rankUser.length <= 6 ? rankUser.length : 6;
    for(let i = 0; i < list; i++){
        let tropy = '';
        switch(rankUser[i].rank){
            case 1: 
                tropy = 'tropy__gold';
                break;
            case 2:
                tropy = 'tropy__silver';
                break;
            case 3:
                tropy = 'tropy__bronze';
                break;
            default:
                tropy = 'tropy__empty';
                break;
        }

        const tr = document.createElement('tr');
        tr.classList.add('rank__number');
        tr.innerHTML = `
        <td>
            <span class="material-icons ${tropy}">emoji_events</span>
            <span class="rank__id">${rankUser[i].id}</span>
        </td>
        <td>
            <span class="rank__score">${rankUser[i].score}</span>
        </td>
        `;

        rankList.appendChild(tr);
    }
    
}

function updateRank(users){
    rankRepository.updateRank(users);
}

function removeRank(users){
    rankRepository.removeRank(users);
}

function setRankUser(users){
    rankUser = [];
    for(let key of Object.keys(users)){
        rankUser.push({'id':users[key].id, 'pid':users[key].pid ,'score':users[key].score});
    }
    sortRank();
    updateRankText();
}

function sortRank(){
    if(rankUser.length < 1){
        return;
    }
    rankUser = rankUser.sort((a, b) => b.score - a.score);
    let max = rankUser[0].score;
    let rank = 1;
    
    for(let i = 0; i < rankUser.length; i++){
        if(rankUser[i].score >= max){
            rankUser[i].rank = rank;
        }else{
            rank++;
            rankUser[i].rank = rank;
            max = rankUser[i].score;
        }
    }
}

function readRank(){
    let stopSync = rankRepository.getRank(users => {
        setRankUser(users);
    });
    return () => stopSync();
}

function rankInit(){
    rankRepository.init();
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
    showFinishPopUp();
    if(result && user.level !== 3){
        showFinishPopUpText(msg, 'next');
    }else if(result && user.level === 3){
        showFinishPopUpText(msg, 'final');
    }else{
        showFinishPopUpText(msg, 'end');
    }
}

function onPopUpClick(e){
    hideFinishPopUp();

    if(e.currentTarget.matches('.fa-play')){
        goToNextStage();
    }else{
        calcRank();
        showStartScreen(playScreen);
    }
}

function calcRank(){
    rankUser.push(user);
    sortRank();
    const newRankUser = rankUser.filter(rankUser => rankUser.pid === user.pid);
    if(newRankUser[0].rank <= 3){
        rankUser = rankUser.filter(rankUser => rankUser.rank <= 3);
        updateRank(rankUser);
    }
}

function goToNextStage(){
    init();
}

function showFinishPopUpText(msg, nextMsg){
    popUp_finishMsg.textContent = msg;

    switch(nextMsg){
        case 'next':
            addTimeScore();
            user.level++;
            popUp_nextMsg.textContent = `Next Level ${user.level}`;
            popUp_btnIcon.classList.remove('fa-undo'); 
            popUp_btnIcon.classList.remove('fa-stop'); 
            popUp_btnIcon.classList.add('fa-play'); 
            break;
        case 'final':
            addTimeScore();
            popUp_nextMsg.textContent = `Final Score: ${user.score}`;
            popUp_btnIcon.classList.remove('fa-play'); 
            popUp_btnIcon.classList.remove('fa-stop'); 
            popUp_btnIcon.classList.add('fa-undo'); 
            break;
        case 'end':
            popUp_nextMsg.textContent = `Score: ${user.score}`;
            popUp_btnIcon.classList.remove('fa-play'); 
            popUp_btnIcon.classList.remove('fa-undo'); 
            popUp_btnIcon.classList.add('fa-stop');
            
            break;
    }
}

function addTimeScore(){
    setTimeout(() => {
        updateScoreText(remainingTime * TIME_SCORE);
    }, 1000);
}

function showFinishPopUp(){
    playField.style.pointerEvents = 'none';
    popUp.style.display= 'block';
    popUp_finish.style.display = 'block';
}

function hideFinishPopUp(){
    playField.style.pointerEvents = 'visible';
    popUp.style.display= 'none';
    popUp_finish.style.display = 'none';
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

function updateScoreText(score){
    user.score += score;
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
    readRank();
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

  if(rankUser.length > 6){
    const outs = rankUser.filter(user => user.rank > 3);
    removeRank(outs);
}

}

function userInfoInit(){
    user.id = null;
    user.pid = 0;
    user.score = 0;
    user.level = 1;
    user.rank = 100;
}

function playStanByTimer(){
    let timeout = STANBY_TIME;
    playField.style.pointerEvents = 'none';
    popUp.style.display = 'block';
    popUp_stanBy.style.display = 'block';

    stanByTimerId = setInterval(() => {
        if(timeout > 0){
            timeout--;
            stanByCounter.textContent = timeout;
        }else{
            clearInterval(stanByTimerId);
            playField.style.pointerEvents = 'visible';
            popUp.style.display = 'none';
            popUp_stanBy.style.display = 'none';
            playTimer();
        }
    }, 1000);
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
    
    stanByCounter.textContent = STANBY_TIME;
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
