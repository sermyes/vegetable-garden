import RankRepository from './service/rank_repository.js';

export default class Rank {
  constructor() {
    this.list = document.querySelector('.rank__list');
    this.repository = new RankRepository();
    this.users = [];
  }

  update(users) {
    this.repository.updateRank(users);
  }

  remove(users) {
    this.repository.removeRank(users);
  }

  setUser(userList) {
    this.users = [];
    for (let key of Object.keys(userList)) {
      this.users.push({
        id: userList[key].id,
        pid: userList[key].pid,
        score: userList[key].score
      });
    }
    this.sort();
    this.updateText();
  }

  sort() {
    if (this.users.length < 1) {
      return;
    }
    this.users = this.users.sort((a, b) => b.score - a.score);
    let max = this.users[0].score;
    let rank = 1;

    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].score >= max) {
        this.users[i].rank = rank;
      } else {
        rank++;
        this.users[i].rank = rank;
        max = this.users[i].score;
      }
    }
  }

  read() {
    let stopSync = this.repository.getRank(users => {
      this.setUser(users);
    });
    return () => stopSync();
  }

  init() {
    this.repository.init();
  }

  calc(user) {
    this.users.push(user);
    this.sort();
    const newusers = this.users.filter(users => users.pid === user.pid);
    if (newusers[0].rank <= 3) {
      this.users = this.users.filter(users => users.rank <= 3);
      this.update(this.users);
    }
    if (this.users.length > 6) {
      const outs = this.users.filter(user => user.rank > 3);
      this.remove(outs);
    }
  }

  updateText() {
    this.list.innerHTML = '';
    let list = this.users.length <= 6 ? this.users.length : 6;
    for (let i = 0; i < list; i++) {
      let tropy = '';
      switch (this.users[i].rank) {
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
                <span class="rank__id">${this.users[i].id}</span>
            </td>
            <td>
                <span class="rank__score">${this.users[i].score}</span>
            </td>
            `;

      this.list.appendChild(tr);
    }
  }
}
