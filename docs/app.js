const socket = io('https://uno-g4vb.onrender.com'); 
//const socket = io('http://localhost:3000');

const handDiv = document.getElementById('hand');
const enemyHandDiv = document.getElementById('enemy-hand');
const topCardDiv = document.getElementById('top-card');
const status = document.getElementById('status');
const pickBtn = document.getElementById('pick');

let hand = [];
let handCount = 0;
let enemyHand = [];
let enemyHandCount = 0;

let pile = [{color: 'grey', value: ''}];
let deck = [];

function renderHand() {
    handDiv.innerHTML = '';

    let topCard = hand[hand.length-1];

    hand.sort((a, b) => {
        if (a.color[0] < b.color[0]) return -1;
        if (a.color[0] > b.color[0]) return 1;
        if (a.color[1] < b.color[1]) return -1;
        if (a.color[1] > b.color[1]) return 1;

        if (a.value[0] < b.value[0]) return -1;
        if (a.value[0] > b.value[0]) return 1;
        return 0;
    });

    let topIndex = 0;
    for (let i = 0; i < hand.length; i++) {
        if (hand[i].color == topCard.color && hand[i].value == topCard.value) {
            topIndex = i;
            break;
        }
    }

    for (let i = 0; i < hand.length; i++) {
        const el = createCardElement(hand[i]);

        if (handCount > hand.length || i != topIndex) {
            el.classList.add('card-entered');
        } else { 
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    handDiv.children[topIndex].classList.add('card-entered');
                })
            })
        }

        el.onclick = () => {
            let card = hand[i];
            pile.push(card);
            hand.splice(i, 1);
            socket.emit('lay_card', card, hand);
            renderHand();
            updateTopCard();
        };
        handDiv.appendChild(el);
    }

    handCount = hand.length;
}

function renderOtherHand() {
    enemyHandDiv.innerHTML = '';
    for (let i = 0; i < enemyHand.length; i++) {
        const el = createCardElement({color: 'black', value: ''});
        if (i < enemyHand.length - 1) {
            el.classList.add('card-entered');
        } else {
         requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    el.classList.add('card-entered');
                })
            })
        }
        enemyHandDiv.appendChild(el);
    };
    enemyHandCount = enemyHand.length;
}

function createCardElement(card) {
    const el = document.createElement('div');
    el.className = `card ${card.color}`;
    el.textContent = `${card.value}`;
    return el;
}


pickBtn.onclick = () => {
    socket.emit('pick_card');
};
topCardDiv.onclick = () => {
    socket.emit('pick_pile_card', hand);
    pile.pop();
    if (topCardDiv.lastElementChild != null) {
        topCardDiv.lastElementChild.remove();
    }
}

socket.on('connect', () => {
    status.textContent = 'Connected. Waiting for another player...';
});

socket.on('joined', (data) => {
    console.log('You joined as', data.id);
});

socket.on('game_start', (startPile) => {
    status.textContent = 'Game Started!';
    pile = startPile;
    updateTopCard();
});

socket.on('picked_card', (card) => {
    hand.push(card);
    renderHand();
});

socket.on('pop_pile', () => {
    pile.pop();
    if (topCardDiv.lastElementChild != null) {
        topCardDiv.lastElementChild.remove();
    }
});

socket.on('update_enemy_hand', (e_hand) => {
    enemyHand = [];
    enemyHand = e_hand;
    renderOtherHand();
});

socket.on('card_laid', ({ card }) => {
    pile.push(card);
    updateTopCard();
});

socket.on('player_left', () => {
    status.textContent = 'Other player left. Waiting...';

    hand = [];
    enemyHand = [];
    enemyHand = [];
    renderHand();
    renderOtherHand();
    pile = [];
    topCardDiv.innerHTML = '';
});

function updateTopCard() {
    if (pile.length > 0) {
        let el = createCardElement(pile[pile.length-1]);
        el.classList.add('pile-card');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.classList.add('card-entered');
                let rotation = (Math.random() - 0.5) * 20;
                el.style.transform += ' rotate(' + rotation + 'deg)';
            })
        })
        topCardDiv.appendChild(el);
    }
}
