const STANBY_TIME = 5;

export class PopUp{
    constructor(user){
        this.popUp_finish = document.querySelector('.pop-up__finish');
        this.popUp_nextMsg = document.querySelector('.pop-up__nextMsg');
        this.popUp_finishMsg = document.querySelector('.pop-up__finishMsg');
        this.popUp_btnIcon = document.querySelector('.fas');
        this.popUp = document.querySelector('.pop-up');
        this.popUp_stanBy = document.querySelector('.pop-up__stanBy')
        this.stanByCounter = document.querySelector('.stanBy__counter');
        this.stanByTimerId = 0;
        this.user = user;

        this.popUp_btnIcon.addEventListener('click',this.onClick);
    }

    onClick = (e) => {
        this.hideFinish();
        
        if(e.currentTarget.matches('.fa-play')){
            this.onPopUpClick && this.onPopUpClick('play');
            
        }else{
            this.onPopUpClick && this.onPopUpClick('stop');
        }
    }

    setClickListener(onPopUpClick){
        this.onPopUpClick = onPopUpClick;
    }

    setPlayTimerListener(setPlayTimer){
        this.setPlayTimer = setPlayTimer;
    }

    showFinishText(msg, nextMsg){
        this.showFinish();
        this.popUp_finishMsg.textContent = msg;
    
        switch(nextMsg){
            case 'next':
                this.popUp_nextMsg.textContent = `Next Level ${this.user.level}`;
                this.popUp_btnIcon.classList.remove('fa-undo'); 
                this.popUp_btnIcon.classList.remove('fa-stop'); 
                this.popUp_btnIcon.classList.add('fa-play'); 
                break;
            case 'final':
                this.popUp_nextMsg.textContent = `Final Score: ${this.user.score}`;
                this.popUp_btnIcon.classList.remove('fa-play'); 
                this.popUp_btnIcon.classList.remove('fa-stop'); 
                this.popUp_btnIcon.classList.add('fa-undo'); 
                break;
            case 'end':
                this.popUp_nextMsg.textContent = `Score: ${this.user.score}`;
                this.popUp_btnIcon.classList.remove('fa-play'); 
                this.popUp_btnIcon.classList.remove('fa-undo'); 
                this.popUp_btnIcon.classList.add('fa-stop');
                break;
        }
    }
    
    showFinish(){
        this.popUp.style.display= 'block';
        this.popUp_finish.style.display = 'block';
    }
    
    hideFinish(){
        this.popUp.style.display= 'none';
        this.popUp_finish.style.display = 'none';
    }

    showStanBy(){
        this.popUp.style.display = 'block';
        this.popUp_stanBy.style.display = 'block';
        this.playStanBy();
    }

    hideStanBy(){
        this.popUp.style.display = 'none';
        this.popUp_stanBy.style.display = 'none';
    }

    playStanBy(){
        this.stanByCounter.textContent = STANBY_TIME;
        let timeout = STANBY_TIME;

        this.stanByTimerId = setInterval(() => {
            if(timeout > 0){
                timeout--;
                this.stanByCounter.textContent = timeout;
            }else{
                clearInterval(this.stanByTimerId);
                this.hideStanBy();
                this.setPlayTimer && this.setPlayTimer();
            }
        }, 1000);
    }
}