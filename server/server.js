const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const message = require('./utils/message');

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '../public');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.emit('newMessage', message('Dev', 'Welcome to the chat application!'));

    socket.broadcast.emit('newMessage', message('Dev', 'New user has jointed the chatroom!'));

    socket.on('createMessage', (msg, callback) => {
        console.log(msg);

        io.emit('newMessage', message(msg.from, msg.text));

        callback('Ok');
    })

    socket.on('disconnect', () => {
        console.log('User disconnected from server');
    });
});

server.listen(port, () => {
    console.log(`Server has started on port ${port}`);
});
