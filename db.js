const yaml_config = require('node-yaml-config');
const config = yaml_config.load(__dirname + '/config/worker.yml')

const redis = require("redis")
const client = redis.createClient()

client.on("error", function(error) {
    console.error(error)
})

module.exports = client