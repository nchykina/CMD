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


var express = require('express');
var express_cp = require('cookie-parser');
var express_sess = require('express-session');
var cookie = require('cookie');
var connect = require('connect');
var redis_connect = require('connect-redis');

var config = require('./config');
var logger = require('./logger');
var spamBlocker = require('express-spam-referral-blocker');
var spamList = require('./logs/referral_spam_list');
var sitemap = require('./seo/sitemap');

var User = require('./models/user');

var app = express();
var http = require('http').Server(app);

var SESS_REDIS_URL = 'redis://' + config.redis_host + ':6379/0'; //session storage

/* Socket.IO Redis Custom storage
 * 
 * see https://github.com/socketio/socket.io-redis#custom-client-eg-with-authentication
 */

var redis_cli = require('redis');

var redis = {
    sess_cli: redis_cli.createClient(SESS_REDIS_URL),
    sess_store: null
};

redis.sess_store = redis_connect(express_sess);

var sess_store = express_sess({store: new redis.sess_store({client: redis.sess_cli}), secret: config.session_secret, key: config.session_sid});

app.use(function (req, res, next) {
    if ((req.hostname === "babyboom.ru") ||
            (req.hostname === "www.babyboom.ru")) {
        res.status(301).send('Stop this!');
        return;
    }

    next();
});

app.use(function (req, res, next) {
    if ((req.hostname === "babyboom.ru") ||
            (req.hostname === "www.babyboom.ru")) {
        res.status(301).send('Stop this!');
        return;
    }

    next();
});


app.get('/sitemap.xml', function (req, res) {
    res.header('Content-Type', 'application/xml');
    res.send(sitemap.toString());
});


app.use(require('morgan')({"stream": logger.stream}));
spamBlocker.addToReferrers(spamList);
app.use(spamBlocker.send404);

app.use(express_cp());
app.use(sess_store);

/* Custom middleware - set session role to anonymous by default */
app.use(function (req, res, next) {
    var sess = req.session;

    if (!sess) {
        return next();
    }

    if (!sess.role) {
        sess.role = 'anonymous';
    }

    next();
});

var passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

var apiRouter = express.Router();
var apis = require('./api/api_registry');
apis.http_bind(apiRouter);
app.use('/api', apiRouter);
//register API hooks
//app.use('/api',)
app.use('/', express.static(__dirname + '/../app'));

//var router = app.Router;
app.all('/*', function (req, res, next) {
    res.sendFile('index.html', {root: 'app'});
});

/*app.get('/', function (req, res) {
 res.sendFile(__dirname + '/node_index.html');
 });*/



//server = http.createServer(app)
//server.listen(3000);


//var socket = io.listen(server);



http.listen(3000, function () {
    console.log('http listening on *:3000');
});

var https = require('https');
var fs = require('fs');

var ssl_options = {
    key: fs.readFileSync('node/ssl/pkey.pem'),
    cert: fs.readFileSync('node/ssl/cert.pem')
};

https.createServer(ssl_options, app).listen(config.ssl_port, function () {
    console.log('https listening on *:' + config.ssl_port);
});

var ios = require("./io");

ios.setHttp(http);
ios.setHttps(https);

for (var i in ios.ios) {
    var io = ios.ios[i];

    /* use the same session store for Socket.IO.
     * see http://stackoverflow.com/questions/25532692/how-to-share-sessions-with-socket-io-1-x-and-express-4-x
     */
    io.use(function (socket, next) {
        sess_store(socket.request, socket.request.res, next);
    });    

    io.use(function (socket, next) {
        var handshakeData = socket.request;

        if (handshakeData.headers.cookie) {

            handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);

            handshakeData.sessionID = express_cp.signedCookie(handshakeData.cookie[config.session_sid], config.session_secret);

            if (handshakeData.cookie[config.session_sid] === handshakeData.sessionID) {
                console.log('Cookie is invalid.');
                return next(new Error('Cookie is invalid.'));
            } else {
                //ok. cookie is not forged, let's load the session
                //console.log("socket.io connected client: "+handshakeData.session.userid);

                /* if(!handshakeData.session.key){
                 console.log('No session');
                 return next(new Error('No session'));
                 } */

                /* if(!handshakeData.session.role){
                 return next(new Error('Internal error: session role has to be always set'));
                 } */

                /* if(handshakeData.session.role === 'anonymous'){
                 return next(new Error('Anonymous access not allowed'));
                 } */

                /* if(!handshakeData.session.passport.user){
                 console.log('Malformed session: no userid');
                 console.log(handshakeData.session);
                 return next(new Error('Malformed session: no userid'));
                 } */
            }

        } else {
            console.log('No cookie transmitted');
            return next(new Error('No cookie transmitted.'));
        }



        return next();

    });    

    io.on('connection', function (socket) {
        var hs = socket.handshake;

        var userid = socket.request.session.passport.user ? socket.request.session.passport.user : 'anonymous';

        console.log('a user connected: ' + userid);
        //users[hs.session.username] = socket.id;
        //clients[socket.id] = socket;
        
        //console.log(socket);

        socket.emit('welcome', socket.request.session.passport.user);

        apis.io_bind(socket);

        socket.on('disconnect', function () {
            //delete clients[socket.id]; // remove the client from the array
            //delete users[hs.session.username]; // remove connected user & socket.id
            
        });
    });

}

