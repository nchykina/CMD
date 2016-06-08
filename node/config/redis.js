var redis_cli = require('redis');
var express = require('express');






var SESS_REDIS_URL = 'redis://192.168.1.7:6379/0'; //session storage

var SIO_REDIS_URL = 'redis://192.168.1.7:6379/1'; //socket.io storage
var SOCKSTORE_REDIS_URL = 'redis://192.168.1.7:6379/2'; //storage for mappings between sessions and sockids

/* Socket.IO Redis Custom storage
 * 
 * see https://github.com/socketio/socket.io-redis#custom-client-eg-with-authentication
 */

var redis_struct = {
  sess_cli: redis_cli.createClient(SESS_REDIS_URL),
  sub_cli: redis_cli.createClient(SIO_REDIS_URL),
  pub_cli: redis_cli.createClient(SIO_REDIS_URL, {return_buffers: true }),
  sess_store: null
  
};

module.exports = redis_struct;
