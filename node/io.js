var config = require('./config');

//var io = require('socket.io')(http);
var io_redis = require('socket.io-redis');

var redis_cli = require('redis');

var SIO_REDIS_URL = 'redis://'+config.redis_host+':6379/1'; //socket.io storage

var sub_cli = redis_cli.createClient(SIO_REDIS_URL);
var pub_cli = redis_cli.createClient(SIO_REDIS_URL, {return_buffers: true });

/* set storage to redis
     * see http://stackoverflow.com/questions/4647348/send-message-to-specific-client-with-socket-io-and-node-js
     */

var emit = require('socket.io-emitter');

module.exports = {
    ios: [],
    
    setHttp: function(http){
        this.http_io = require('socket.io')(http);
        this.http_io.adapter(io_redis({pubClient: pub_cli, subClient: sub_cli}));
        this.ios[0] = this.http_io;
    },
    
    setHttps: function(http){
        this.https_io = require('socket.io')(http);
        this.https_io.adapter(io_redis({pubClient: pub_cli, subClient: sub_cli}));
        this.ios[1] = this.https_io;
    }
    
    
    
};

module.exports.emitter = emit(pub_cli);