import firebaseApp from './firebase.js';

class RankRepository{
    updateRank(users){
        for(let i = 0; i < users.length; i++){
            firebaseApp.database().ref(`rank/${users[i].pid}`).update({
                id: users[i].id,
                pid: users[i].pid,
                score: users[i].score,
            });
        }
    }

    getRank(onRead){
        const ref = firebaseApp.database().ref(`rank`);
        ref.on('value', snapshot => {
            snapshot.val() && onRead(snapshot.val());

            return () => ref.off();
        });
    }

    removeRank(users){
        for(let i = 0; i < users.length; i++){
            firebaseApp.database().ref(`rank/${users[i].pid}`).remove();
        }
    }

    init(){
        firebaseApp.database().ref(`rank`).remove();
    }
}

export default RankRepository;