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

        socket.emit('newMessage', generateMessage('Admin', `Welcome, ${params.name}!`));
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Dev', `${params.name} has joined!`));
        callback();
    });

    // Create message listener
    socket.on('createMessage', (msg, callback) => {
        const user = users.getUser(socket.id);

        // If user does not exist, return callback with access denied message
        if (!user) {
            return callback('Access Denied.');
        }

        // If user exists and text is non-empty string, generate message
        if (isRealString(msg.text)) {
            io.to(user.room).emit('newMessage', generateMessage(user.name, msg.text));
            return callback();
        }

        // Alert if message is empty
        callback('Please enter a message.');
    });

    // Create location message listener
    socket.on('createLocationMessage', ({ latitude, longitude }) => {
        const user = users.getUser(socket.id);

        if (user) {
            io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, latitude, longitude));
        }
    });

    // Disconnect listener
    socket.on('disconnect', () => {
        const user = users.removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left a chatroom.`));
        }

    });
});

server.listen(port, () => {
    console.log(`Server has started on port ${port}`);
});
