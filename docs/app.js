//const socket = io('https://uno-g4vb.onrender.com'); // <-- Replace this
const socket = io('http://localhost:3000');

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
    for (let i = 0; i < hand.length; i++) {
        const el = createCardElement(hand[i]);

        if (i < hand.length-1) {
            el.classList.add('card-entered');
        }

        el.onclick = () => {
          socket.emit('lay_card', hand[i]);
            pile.push(hand[i]);
          hand.splice(i, 1);
            renderHand();
            updateTopCard();
        };
        handDiv.appendChild(el);
    }


    if (handDiv.lastElementChild != null) {
        if (handCount < hand.length) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    handDiv.lastElementChild.classList.add('card-entered');
                })
            })
        } else {
            handDiv.lastElementChild.classList.add('card-entered');
        }
    }
    handCount = hand.length;
}

function renderOtherHand() {
    enemyHandDiv.innerHTML = '';
    for (let i = 0; i < enemyHand.length; i++) {
        const el = createBlankCardElement();
        if (i < enemyHand.length - 1) {
            el.classList.add('card-entered');
        }
        enemyHandDiv.appendChild(el);
    };
    if (enemyHandCount < enemyHand.length) {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                enemyHandDiv.lastElementChild.classList.add('card-entered');
            })
        })
    }
    enemyHandCount = enemyHand.length;
}

function createCardElement(card) {
    const el = document.createElement('div');
    el.className = `card ${card.color}`;
    el.textContent = `${card.value}`;
    return el;
}

function createBlankCardElement() {
    const el = document.createElement('div');
    el.className = 'card black'
    el.textContent = '?';
    return el;
}

pickBtn.onclick = () => {
    socket.emit('pick_card');
};

socket.on('connect', () => {
    status.textContent = 'Connected. Waiting for another player...';
});

socket.on('joined', (data) => {
    console.log('You joined as', data.id);
});

socket.on('game_start', (data) => {
    status.textContent = 'Game Started!';
    updateTopCard(data.topCard);
});

socket.on('picked_card', (card) => {
    hand.push(card);
    renderHand();
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
            })
        })
        topCardDiv.appendChild(el);
    }
}
