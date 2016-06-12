var config = {};

config.redis_host = process.env.REDIS_HOST || 'localhost';
config.mongo_host = process.env.MONGO_HOST || 'localhost';
config.storage_root = process.env.STORAGE_ROOT || '/jobfiles';

module.exports = config;
