const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '../public');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('join', (params, callback) => {
        if (!isRealString(params.name) || !isRealString(params.room)) {
            callback('Name and room name are required.')
        }

        socket.join(params.room);

        socket.emit('newMessage', generateMessage('Dev', `Welcome, ${params.name}!`));
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Dev', `${params.name} has joined!`));
        callback();
    });

    socket.on('createMessage', (msg, callback) => {
        console.log(msg);

        io.emit('newMessage', generateMessage(msg.from, msg.text));

        callback('Ok');
    });

    socket.on('createLocationMessage', ({ latitude, longitude }) => {
        io.emit('newLocationMessage', generateLocationMessage('Admin', latitude, longitude));
    });

    socket.on('disconnect', () => {
        console.log('User disconnected from server');
    });
});

server.listen(port, () => {
    console.log(`Server has started on port ${port}`);
});
