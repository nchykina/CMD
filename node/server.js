/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* var SIO_RES_PARAMS = {
    key: 'sio_evt',
    host: '192.168.1.7',
    port: '6379',
    
}; */

var SESS_SECRET = 'I love nuts!'; //secret to encrypt cookie (weak forging prevention)
var SESS_SID = 'ngs.sid'; //name of cookie

var redis = require('./config/redis');
var express = require('express');
var express_cp = require('cookie-parser');
var express_sess = require('express-session');
var cookie = require('cookie');
var connect = require('connect');
var redis_connect = require('connect-redis');


var User = require('./models/user');

var app = express();
var http = require('http').Server(app);

redis.sess_store = redis_connect(express_sess);

var sess_store = express_sess({store: new redis.sess_store({client: redis.sess_cli}), secret: SESS_SECRET, key: 'ngs.sid'});

app.use(express_cp());
app.use(sess_store);

/* Custom middleware - set session role to anonymous by default */
app.use(function (req, res, next) {
    var sess = req.session;
    
    if(!sess){
        next();
    }
    
    if(!sess.role) {
        sess.role = 'anonymous';
    }
  
  next();
});

var passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

var apiRouter = express.Router();
var apis = require('./api/api_registry');
apis(apiRouter);
app.use('/api',apiRouter);
//register API hooks
//app.use('/api',)
app.use('/',express.static(__dirname + '/../app'));

//var router = app.Router;
app.all('/*', function(req, res, next) {
  res.sendfile('index.html', { root: 'app' });
});

/*app.get('/', function (req, res) {
    res.sendFile(__dirname + '/node_index.html');
});*/



//server = http.createServer(app)
//server.listen(3000);

var io = require('socket.io')(http);
var io_redis = require('socket.io-redis');
//var socket = io.listen(server);


/* use the same session store for Socket.IO.
 * see http://stackoverflow.com/questions/25532692/how-to-share-sessions-with-socket-io-1-x-and-express-4-x
 */
io.use(function(socket, next) {
    sess_store(socket.request, socket.request.res, next);
});

/* set storage to redis
 * see http://stackoverflow.com/questions/4647348/send-message-to-specific-client-with-socket-io-and-node-js
 */
io.adapter(io_redis({pubClient: redis.pub_cli, subClient: redis.sub_cli }));

io.use(function(socket, next) {
    var handshakeData = socket.request;
    
    if (handshakeData.headers.cookie) {

    handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);

    handshakeData.sessionID = express_cp.signedCookie(handshakeData.cookie[SESS_SID], SESS_SECRET);            

    if (handshakeData.cookie[SESS_SID] === handshakeData.sessionID) {
      console.log('Cookie is invalid.');
      return next(new Error('Cookie is invalid.'));
    }
    else {
      //ok. cookie is not forged, let's load the session
      console.log(handshakeData.session);
      
      /* if(!handshakeData.session.key){
          console.log('No session');
          return next(new Error('No session'));
      } */
            
      if(!handshakeData.session.role){
          return next(new Error('Internal error: session role has to be always set'));
      }
      
      if(handshakeData.session.role === 'anonymous'){
          return next(new Error('Anonymous access not allowed'));
      }
      
      if(!handshakeData.session.userid){
          console.log('Malformed session: no userid');
          return next(new Error('Malformed session: no userid'));
      }
    }

  } else {
    console.log('No cookie transmitted');
    return next(new Error('No cookie transmitted.'));
  }
  
  

  return next();   
    
});

var clients = {};
var users = {};

var socket_remember;

io.on('connection', function(socket){
    var hs = socket.handshake;
    console.log('a user connected: ' + socket.id);
    //users[hs.session.username] = socket.id;
    //clients[socket.id] = socket;
    socket_remember = socket;
    
    socket.on('disconnect', function () {
    //delete clients[socket.id]; // remove the client from the array
    //delete users[hs.session.username]; // remove connected user & socket.id
    socket_remember = null;
    });
  });
 
var sequence = 1;
  
setInterval(function(){
    if(socket_remember!=null){
        //console.log("Emit!");
        socket_remember.emit('data',"Test data"+sequence++);
    }
    //clients[0].emit("Hello Alex, how've you been");
},500);

http.listen(3000, function(){
  console.log('listening on *:3000');
});


