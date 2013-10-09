var configs = require("../configs/global.js"), //loading configs
    redis = require("redis");

global.RedisCliSub = redis.createClient(configs.redisServerPort, configs.redisServerHost); //用于订阅频道及接收消息
global.RedisCliPub = redis.createClient(configs.redisServerPort, configs.redisServerHost); //用于向频道发布消息以及更新各个频道缓存的消息


RedisCliSub.on("message", function(channel, message) { //接收已经订阅的频道的消息


    console.log("RedisCliSub received a message:" + message);
    var usersInChannel = [];
    for (var channelname in channels) { //检测是哪个频道
        if (channelname == channel) {
            usersInChannel = channels[channelname];
            break;
        }
    }
    console.log(usersInChannel);
    for (var i = 0; i < usersInChannel.length; i++) { //广播频道消息
        for (var uid in clientConns) {
            if (uid == usersInChannel[i]) {
                if (clientConns[uid]) {
                    if (new Date().getTime() - clientConns[uid].lastSendTime > configs.maxSendMsgHz) { //判断是否频繁发言
                        //console.log(clientConns[uid].lastSendTime);
                        clientConns[uid].lastSendTime=new Date().getTime();
                        console.log(clientConns[uid].lastSendTime);
                        //clientConns[uid].client.send(message);
                    
                    } else {
                        console.log("send frequency...");
                    }
                break;
                }
            }

        }

    }
});