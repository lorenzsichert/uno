const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const generateDeck = require('./deck');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' }
});

let players = {};
let deck = [];
let pile = [];

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    players[socket.id] = [];

    let player_count = Object.keys(players).length;
    if (player_count > 2) {
    socket.emit('room_full');
    socket.disconnect();
    return;
    }

    console.log(player_count);
    socket.emit('joined', { id: socket.id });
    io.emit('players_update', players);

    if (player_count === 2) {
        deck = generateDeck();
        pile = [deck.pop()];
        io.emit('game_start', pile);
    }

    socket.on('lay_card', (card, hand) => {
        pile.push(card);
        for (let i = 0; i < players[socket.id].length; i++) {
            if (players[socket.id][i].color == card.color && players[socket.id][i].value == card.value) {
                players[socket.id].splice(i, 1); 
                break;
            } 
        }
        socket.broadcast.emit('card_laid', { card, by: socket.id });
        socket.broadcast.emit('update_enemy_hand', hand);
    });

    socket.on('pick_card', () => {
        if (deck.length === 0) deck = generateDeck();
        const card = deck.pop();
        players[socket.id].push(card);
        socket.emit('picked_card', card);
        socket.broadcast.emit('update_enemy_hand', players[socket.id]);
    });

    socket.on('pick_pile_card', (hand) => {
        if (pile.length === 0) { return; }   

        const card = pile.pop();
        players[socket.id].push(card);
        socket.emit('picked_card', card);
        socket.broadcast.emit('pop_pile');
        socket.broadcast.emit('update_enemy_hand', players[socket.id]);
    });

    socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete players[socket.id];
    io.emit('player_left', socket.id);
    if (Object.keys(players).length < 2) {
          deck = [];
          pile = [];
    }
    });
});

server.listen(3000, () => console.log('Uno server running on port 3000'));
