var config = require('./config');

//var io = require('socket.io')(http);
var io_redis = require('socket.io-redis');

var redis_cli = require('redis');

var SIO_REDIS_URL = 'redis://'+config.redis_host+':6379/1'; //socket.io storage

//var sub_cli = redis_cli.createClient(SIO_REDIS_URL);
//var pub_cli = redis_cli.createClient(SIO_REDIS_URL, {return_buffers: true });

/* set storage to redis
     * see http://stackoverflow.com/questions/4647348/send-message-to-specific-client-with-socket-io-and-node-js
     */

var emit = require('socket.io-emitter');

var ios = [];

module.exports = {
    ios: ios,
    
    setHttp: function(http){
        var http_io = require('socket.io')(http);
        http_io.adapter(io_redis({host: config.redis.host, port: config.redis.port}));
        ios[0] = http_io;
    },
    
    setHttps: function(https){
        var https_io = require('socket.io')(https);
        https_io.adapter(io_redis({host: config.redis.host, port: config.redis.port}));
        ios[1] = https_io;
    }
    
};

module.exports.emitter = emit({host: config.redis.host, port: config.redis.port});