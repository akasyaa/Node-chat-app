var socket = io();

socket.on('connect', function() {
    console.log('Connected to the server');

    socket.emit('createMessage', {
        from: 'me',
        text: 'My message',
    })
});

socket.on('disconnect', function() {
    console.log('Server disconnected');
});

socket.on('newMessage', function(msg) {
    console.log('New message', msg);
});
