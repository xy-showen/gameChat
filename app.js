var configs = require("./configs/global.js"),
    initLog4js = require('./logs/InitLog4js')(),
    verifyCli = require('./verifyCli/verifyCli').verify,
    filterCharacter=require('./filterCharacter/filterCharacter').filter,
    _ = require("underscore")._,
    redis = require("redis"),
    RedisCliSub = redis.createClient(configs.redisServerPort, configs.redisServerHost),
    RedisCliPub = redis.createClient(configs.redisServerPort, configs.redisServerHost),
    WebSocket = require("ws"),
    WebSocketServer = WebSocket.Server,
    MainWebSocketServer = new WebSocketServer({
        port: configs.WSserverPort,
        verifyClient: function(clientInfo) { //验证客户端链接
            //console.log(clientInfo.req.headers);
            console.log("verifyClient succ...");
            return true;
        }
    }, function(err) {
        if (err) {
            console.log("has err when create MainWebSocketServer:" + err);
        } else {
            RedisCliSub.subscribe("channelA");
            console.log("has create MainWebSocketServer succ...");
        }
    });

var clientConns = {};
var channels = {
    channelA: ["uid1", "uid2"],
    channelB: ["uid1", "uid2"]
};
MainWebSocketServer.on("connection", function(client) {
    console.log("has a client connected...");

    client.on("message", function(data, flags) {
        var parseData = data.split("|@|", 2);
        if (parseData[0] == "command") { //进入、创建、退出频道
            console.log("has a command message");
            var userInfo = parseData[1];
            var commandAction = userInfo.split("|")[0];
            var uid = userInfo.split("|")[1];
            var channelname = userInfo.split("|")[2];
            switch (commandAction) {
                case "init":
                    if (!verifyCli()) {
                        return;
                    }
                    clientConns[uid] = client;
                    console.log("has a client inited succ");
                    client.send("ok");
                    break;
                case "enter":
                    if (channels.hasOwnProperty(channelname)) {
                        channels[channelname].push(uid);
                        client.send("ok");
                    } else {
                        client.send("has not the channel:" + channelname);
                    }
                    break;
                case "create":
                    if (channels.hasOwnProperty) {
                        client.send("the channel:" + channelname + " has exist");
                    } else {
                        channels[channelname] = [];
                        client.send("ok");
                    }
                    break;
                case "quit":
                    if (channels.hasOwnProperty(channelname)) {
                        channels[channelname] = _.without(channels[channelname], uid);
                        client.send("ok");
                        if (channels[channelname].length < 1) {
                            RedisCliSub.unsubscribe(channelname);
                        }

                    } else {
                        client.send("the channel:" + channelname + " has not exist");
                    }
                    break;
                default:
            }
        } else if (parseData[0] == "channel") {
            console.log(parseData[1].split("|")[0] + "===" + parseData[1].split("|")[1]);

            RedisCliPub.publish(parseData[1].split("|")[0], filterCharacter(parseData[1].split("|")[1]));
        }
    });
});


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