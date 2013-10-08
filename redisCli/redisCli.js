var configs = require("../configs/global.js"), //loading configs
    redis = require("redis");
global.RedisCliSub = redis.createClient(configs.redisServerPort, configs.redisServerHost);
global.RedisCliPub = redis.createClient(configs.redisServerPort, configs.redisServerHost);
RedisCliSub.on("message", function(channel, message) {
    console.log("RedisCliSub received a message:" + message);
    var usersInChannel = [];
    for (var channelname in channels) {
        if (channelname == channel) {
            usersInChannel = channels[channelname];
            break;
        }
    }
    console.log(usersInChannel);
    for (var i = 0; i < usersInChannel.length; i++) {
        for (var uid in clientConns) {
            if (uid == usersInChannel[i]) {
                clientConns[uid].send(message);
                break;
            }

        }

    }
});