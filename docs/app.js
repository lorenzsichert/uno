const socket = io('http://localhost:3000'); // <-- Replace this

const handDiv = document.getElementById('hand');
const enemyHandDiv = document.getElementById('enemy-hand');
const topCardDiv = document.getElementById('top-card');
const status = document.getElementById('status');
const pickBtn = document.getElementById('pick');

let hand = [];
let enemyHand = [];

let pile = [];
let deck = [];

function renderHand() {
  handDiv.innerHTML = '';
  hand.forEach((card, index) => {
    const el = createCardElement(card);
    el.onclick = () => {
      socket.emit('lay_card', card);
      hand.splice(index, 1);
      renderHand();
        pile.push(card);
            updateTopCard();
    };
    handDiv.appendChild(el);
  });
}

function renderOtherHand() {
    enemyHandDiv.innerHTML = '';
    enemyHand.forEach(_ => {
        const el = createBlankCardElement();
        enemyHandDiv.appendChild(el);
    });
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
    renderHand();
    renderEnemyHand();

    pile = [];
    topCardDiv.innerHTML = '';
});

function updateTopCard() {
    topCardDiv.innerHTML = '';
    if (pile.length > 0) {
        topCardDiv.appendChild(createCardElement(pile[pile.length-1]));
    }
}
