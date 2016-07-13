
var express = require('express');

var cfg = require('../config/config');


var SOCKSTORE_REDIS_URL = 'redis://'+cfg.redis_host+':6379/2'; //storage for mappings between sessions and sockids


module.exports = redis_struct;
