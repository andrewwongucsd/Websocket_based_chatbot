module.exports = function startServer(io) {
  var numUsers = 0;
  var numDr = 0;
  var numPa = 0;

  io.on('connection', function (socket) {
    var addedUser = false;
    console.log('connection');
    socket.emit('peek', {
      numUsers: numUsers,
      numDr: numDr,
      numPa: numPa
    });

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
      console.log('new message');

      // we tell the client to execute 'new message'
      socket.broadcast.emit('new message', {
        username: socket.username,
        usertype: socket.usertype,
        message: data
      });
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (json) {
      console.log('add user');

      if (addedUser) return;
      // we store the username in the socket session for this client
      socket.username = json.username;
      socket.usertype = json.usertype;
      ++numUsers;
      if(socket.usertype == "doctor"){
        ++numDr;
      }else{
        ++numPa;
      }
      addedUser = true;
      socket.emit('login', {
        numUsers: numUsers,
        numDr: numDr,
        numPa: numPa,
        username: socket.username
      });
      // echo globally (all clients) that a person has connected
      socket.broadcast.emit('user joined', {
        username: socket.username,
        usertype: socket.usertype,
        numDr: numDr,
        numPa: numPa,
        numUsers: numUsers
      });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
      console.log('discount');

      if (addedUser) {
        --numUsers;
        if(socket.usertype == "doctor"){
          --numDr;
        }else{
          --numPa;
        }

        // echo globally that this client has left
        socket.broadcast.emit('user left', {
          username: socket.username,
          usertype: socket.usertype,
          numUsers: numUsers
        });
      }
    });
  });
}
