const vegetableSound = new Audio('sound/vegetable_pull.mp3');
const bugSound = new Audio('sound/bug_pull.mp3');
const winSound = new Audio('sound/win.mp3');
const alertSound = new Audio('sound/alert.wav');
const gameBgSound = new Audio('sound/gameBg.mp3');

export function playVegetable(){
    playSound(vegetableSound);
}

export function playBug(){
    playSound(bugSound);
}

export function playAlert(){
    playSound(alertSound);
}

export function playWin(){
    playSound(winSound);
}

export function playGameBg(){
    playSound(gameBgSound);
}

export function stopGameBg(){
    stopSound(gameBgSound);
}

function playSound(sound) {
    sound.currentTime = 0;
    sound.play();
}
  
function stopSound(sound) {
    sound.pause();
}