const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const generateDeck = require('./deck');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' }
});

let players = [];
let deck = [];
let pile = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  if (players.length >= 2) {
    socket.emit('room_full');
    socket.disconnect();
    return;
  }

  players.push(socket.id);
  socket.emit('joined', { id: socket.id });
  io.emit('players_update', players);

  if (players.length === 2) {
    deck = generateDeck();
    pile = [deck.pop()];
    io.emit('game_start', {
      players,
      topCard: pile[pile.length - 1]
    });
  }

  socket.on('lay_card', (card) => {
    pile.push(card);
    io.emit('card_laid', { card, by: socket.id });
  });

  socket.on('pick_card', () => {
    if (deck.length === 0) deck = generateDeck();
    const card = deck.pop();
    socket.emit('picked_card', card);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    players = players.filter(id => id !== socket.id);
    io.emit('player_left', socket.id);
    if (players.length < 2) {
      deck = [];
      pile = [];
    }
  });
});

server.listen(3000, () => console.log('Uno server running on port 3000'));
