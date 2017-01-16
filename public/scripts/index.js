var socket = io();

socket.on('connect', function() {
    console.log('Connected to the server');
});

socket.on('disconnect', function() {
    console.log('Server disconnected');
});

socket.on('newMessage', function(msg) {
    console.log('New message', msg);
    var msg = $('<li></li>').text(`${msg.from}: ${msg.text}`);
    $('#message-list').append(msg);
});

$('#message-form').on('submit', function(e) {
    e.preventDefault();

    socket.emit('createMessage', {
        from: 'User',
        text: $('[name=message]').val()
    }, function(ack) {
        console.log(ack);
    });
});
