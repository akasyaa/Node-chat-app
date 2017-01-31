const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/users');

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '../public');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const users = new Users();

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New user connected');

    // Join listener
    socket.on('join', (params, callback) => {
        if (!isRealString(params.name) || !isRealString(params.room)) {
            return callback('Name and room name are required.');
        }

        // Join room
        socket.join(params.room);

        // Remove user from previous session and add to new session
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);

        // Update user list in a specific room
        io.to(params.room).emit('updateUserList', users.getUserList(params.room));

        socket.emit('newMessage', generateMessage('Dev', `Welcome, ${params.name}!`));
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Dev', `${params.name} has joined!`));
        callback();
    });

    // Create message listener
    socket.on('createMessage', (msg, callback) => {
        console.log(msg);

        io.emit('newMessage', generateMessage(msg.from, msg.text));

        callback('Ok');
    });

    // Create location message listener
    socket.on('createLocationMessage', ({ latitude, longitude }) => {
        io.emit('newLocationMessage', generateLocationMessage('Admin', latitude, longitude));
    });

    // Disconnect listener
    socket.on('disconnect', () => {
        const user = users.removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Dev', `${user.name} has left a chatroom.`));
        }

    });
});

server.listen(port, () => {
    console.log(`Server has started on port ${port}`);
});
