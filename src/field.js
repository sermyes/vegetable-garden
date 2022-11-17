const VEGETABLE_SIZE = 70;
const FIELD_WIDTH = 800;
const FIELD_HEIGHT = 250;
const SCORE = 100;
const ItemMoveDuration = 6000;

export const ItemType = Object.freeze({
  vegetable: 'vegetable',
  bug: 'bug'
});

export class Field {
  constructor(stages, user) {
    this.field = document.querySelector('.play__field');
    this.stages = stages;
    this.user = user;
    this.field.addEventListener('click', this.onClick);
    this.moveTimerId = 0;
  }

  init() {
    this.field.innerHTML = '';

    const vegetableCount = this._divideItem(
      this.stages[this.user.level].VEGETABLE_COUNT,
      3
    );

    for (let i = 0; i < 3; i++) {
      this._addItem(
        ItemType.vegetable,
        vegetableCount[i],
        `assets/images/vegetable${i + 1}.png`
      );
    }

    this._addItem(
      ItemType.bug,
      this.stages[this.user.level].BUG_COUNT,
      'assets/images/bug.png'
    );
  }

  stop() {
    clearInterval(this.moveTimerId);
  }

  _addItem(item, count, src) {
    const x1 = 0;
    const x2 = FIELD_WIDTH - VEGETABLE_SIZE;
    const y1 = 0;
    const y2 = FIELD_HEIGHT - VEGETABLE_SIZE;

    for (let i = 0; i < count; i++) {
      const img = document.createElement('img');
      img.classList.add(item);
      img.setAttribute('src', src);
      img.style.position = 'absolute';
      let x = this.randomNumber(x1, x2);
      let y = this.randomNumber(y1, y2);
      img.style.left = `${x}px`;
      img.style.top = `${y}px`;

      if (this.user.level > 1) {
        let duration = Math.floor(ItemMoveDuration / this.user.level);
        this.moveTimerId = setInterval(() => {
          let x = this.randomNumber(x1, x2);
          let y = this.randomNumber(y1, y2);
          img.style.left = `${x}px`;
          img.style.top = `${y}px`;
        }, duration);
      }

      this.field.appendChild(img);
    }
  }

  randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  _divideItem(itemCount, types) {
    let count = Math.floor(itemCount / types);
    let countArr = new Array(types).fill(count);

    for (let i = 0; i < itemCount % types; i++) {
      countArr[i] += 1;
    }
    return countArr;
  }

  setClickListener(onItemClick) {
    this.onItemClick = onItemClick;
  }

  onClick = e => {
    if (e.target.getAttribute('class') === ItemType.vegetable) {
      e.target.remove();
      this.user.score += SCORE;
      this.onItemClick && this.onItemClick(ItemType.vegetable);
    } else if (e.target.getAttribute('class') === ItemType.bug) {
      this.onItemClick && this.onItemClick(ItemType.bug);
    } else {
      return;
    }
  };
}
