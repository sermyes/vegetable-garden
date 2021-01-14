const VEGETABLE_SIZE = 70;
const FIELD_WIDTH = 800;
const FIELD_HEIGHT = 250

export class Field{
    constructor(LEVEL, user){
        this.field = document.querySelector('.play__field');
        this.started = false;
        this.LEVEL = LEVEL;
        this.user = user;
        this.field.addEventListener('click', this.onClick);
    }

    init(){
        this.started = true;
        this.field.innerHTML = '';

        const vegetableCount = this._divideItem(this.LEVEL[this.user.level].VEGETABLE_COUNT, 3);
        this._addItem('vegetable', vegetableCount[0], '../images/vegetable1.png');
        this._addItem('vegetable', vegetableCount[1], '../images/vegetable2.png');
        this._addItem('vegetable', vegetableCount[2], '../images/vegetable3.png');
        this._addItem('bug', this.LEVEL[this.user.level].BUG_COUNT, 'images/bug.png');
    }

    stop(state){
        this.started = state;
    }

    _addItem(item, count, src){
        const x1 = 0;
        const x2 = FIELD_WIDTH - VEGETABLE_SIZE;
        const y1 = 0;
        const y2 = FIELD_HEIGHT - VEGETABLE_SIZE;
    
        for(let i = 0; i < count; i++){
            const img = document.createElement('img');
            img.classList.add(item);
            img.setAttribute('src', src);
            img.style.position = 'absolute';
            let x = this.randomNumber(x1, x2);
            let y = this.randomNumber(y1, y2);
            img.style.left = `${x}px`;
            img.style.top = `${y}px`; 
            
            if(this.user.level === 2 || this.user.level === 3){
                let duration = this.user.level === 2 ? 3000 : 1500;
                let moveTimerId = setInterval(() => {
                    let x = this.randomNumber(x1, x2);
                    let y = this.randomNumber(y1, y2);
                    img.style.left = `${x}px`;
                    img.style.top = `${y}px`;
    
                    if(this.started === false){
                        clearInterval(moveTimerId);
                    }
                }, duration);
            }
                    
            
            this.field.appendChild(img);
        }
    }

    randomNumber(min, max){
        return Math.floor((Math.random() * (max - min)) + min);
     }

    _divideItem(itemCount, types){
        let count = Math.floor(itemCount / types);
        let countArr = Array(types).fill(count);
    
        for(let i = 0; i < (itemCount % types); i++){
            countArr[i] += 1;
        }
        return countArr;
    }

    setClickListener(onItemClick){
        this.onItemClick = onItemClick;
    }

    onClick = e => {
        if(e.target.getAttribute('class') === 'vegetable'){
            e.target.remove();
            this.onItemClick && this.onItemClick('vegetable'); 
        }else if(e.target.getAttribute('class') === 'bug'){
            this.onItemClick && this.onItemClick('bug'); 
        }else{
            return;
        }
    }
}