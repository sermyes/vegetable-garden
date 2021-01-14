import RankRepository from '../service/rank_repository.js';

export default class Rank{
    constructor(){
        this.rankList = document.querySelector('.rank__list');
        this.rankRepository = new RankRepository();
        this.rankUser = [];
    }

    update(users){
        this.rankRepository.updateRank(users);
    }
    
    remove(users){
        this.rankRepository.removeRank(users);
    }
    
    setUser(users){
        this.rankUser = [];
        for(let key of Object.keys(users)){
            this.rankUser.push({'id':users[key].id, 'pid':users[key].pid ,'score':users[key].score});
        }
        this.sort();
        this.updateText();
    }
    
    sort(){
        if(this.rankUser.length < 1){
            return;
        }
        this.rankUser = this.rankUser.sort((a, b) => b.score - a.score);
        let max = this.rankUser[0].score;
        let rank = 1;
        
        for(let i = 0; i < this.rankUser.length; i++){
            if(this.rankUser[i].score >= max){
                this.rankUser[i].rank = rank;
            }else{
                rank++;
                this.rankUser[i].rank = rank;
                max = this.rankUser[i].score;
            }
        }
    }
    
    read(){
        let stopSync = this.rankRepository.getRank(users => {
            this.setUser(users);
        });
        return () => stopSync();
    }
    
    init(){
        this.rankRepository.init();
    }

    calc(user){
        this.rankUser.push(user);
        this.sort();
        const newRankUser = this.rankUser.filter(rankUser => rankUser.pid === user.pid);
        if(newRankUser[0].rank <= 3){
            this.rankUser = this.rankUser.filter(rankUser => rankUser.rank <= 3);
            this.update(this.rankUser);
        }
        if(this.rankUser.length > 6){
            const outs = this.rankUser.filter(user => user.rank > 3);
            this.remove(outs);
        }
    }

    updateText(){
        this.rankList.innerHTML = '';
        let list = this.rankUser.length <= 6 ? this.rankUser.length : 6;
        for(let i = 0; i < list; i++){
            let tropy = '';
            switch(this.rankUser[i].rank){
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
                <span class="rank__id">${this.rankUser[i].id}</span>
            </td>
            <td>
                <span class="rank__score">${this.rankUser[i].score}</span>
            </td>
            `;
    
            this.rankList.appendChild(tr);
        }
    }
}