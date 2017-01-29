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

socket.on('newLocationMessage', function(msg) {
    var li = $('<li></li>');
    var a = $('<a target="_blank">My current location</a>');

    li.text(`${msg.from}: `);
    a.attr('href', msg.url);

    li.append(a);
    $('#message-list').append(li);
});

/*
 Message form handler
*/

$('#message-form').on('submit', function(e) {
    e.preventDefault();

    var msgBox = $('[name=message]');

    socket.emit('createMessage', {
        from: 'User',
        text: msgBox.val()
    }, function(ack) {
        msgBox.val('');
    });
});

/*
 Location button handler
*/

var locationButton = $('#send-location');

locationButton.on('click', function(e) {
    if (!navigator.geolocation) {
        return alert('Geolocation not supported by your browser.');
    }

    locationButton.attr('disabled', 'disabled').text('Sending location...');

    navigator.geolocation.getCurrentPosition(function(position) {
        locationButton.removeAttr('disabled').text('Send location');

        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    }, function() {
        locationButton.removeAttr('disabled').text('Send location');
        alert('Unable to fetch location.');
    });
});
