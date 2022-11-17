import firebaseApp from './firebase.js';
import {
  getDatabase,
  ref,
  update,
  remove,
  onValue,
  off
} from 'https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js';

class RankRepository {
  constructor() {
    this.database = getDatabase(firebaseApp);
  }
  updateRank(users) {
    for (let i = 0; i < users.length; i++) {
      update(ref(this.database, `rank/${users[i].pid}`), {
        id: users[i].id,
        pid: users[i].pid,
        score: users[i].score
      });
    }
  }

  getRank(onRead) {
    const query = ref(this.database, `rank`);
    onValue(query, snapshot => {
      const value = snapshot.val();
      value && onRead(value);
    });

    return () => off(query);
  }

  removeRank(users) {
    for (let i = 0; i < users.length; i++) {
      remove(ref(this.database, `rank/${users[i].pid}`));
    }
  }

  init() {
    remove(ref(this.database, `rank`));
  }
}

export default RankRepository;
