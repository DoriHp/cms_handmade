//Redis client
var redis = require('redis')
var client = redis.createClient({host : 'localhost', port : 6379})

client.on('ready',function() {
  console.log("Redis is ready")
})

client.on('error',function() {
  console.log("Error in Redis")
})

module.exports = client