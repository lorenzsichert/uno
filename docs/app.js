const socket = io('https://uno-g4vb.onrender.com'); // <-- Replace this

const handDiv = document.getElementById('hand');
const topCardDiv = document.getElementById('top-card');
const status = document.getElementById('status');
const pickBtn = document.getElementById('pick');

let hand = [];

function renderHand() {
  handDiv.innerHTML = '';
  hand.forEach((card, index) => {
    const el = createCardElement(card);
    el.onclick = () => {
      socket.emit('lay_card', card);
      hand.splice(index, 1);
      renderHand();
    };
    handDiv.appendChild(el);
  });
}

function createCardElement(card) {
  const el = document.createElement('div');
  el.className = `card ${card.color}`;
  el.textContent = `${card.color} ${card.value}`;
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

socket.on('card_laid', ({ card }) => {
  updateTopCard(card);
});

socket.on('player_left', () => {
  status.textContent = 'Other player left. Waiting...';
  hand = [];
  renderHand();
  topCardDiv.innerHTML = '';
});

function updateTopCard(card) {
  topCardDiv.innerHTML = '';
  topCardDiv.appendChild(createCardElement(card));
}
