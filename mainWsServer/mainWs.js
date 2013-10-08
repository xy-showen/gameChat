
var WebSocket = require("ws"),
    configs = require("../configs/global.js"),
    verifyCli = require('../verifyCli/verifyCli').verify,
    filterCharacter=require('../filterCharacter/filterCharacter').filter,
    _ = require("underscore")._,
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
            console.log("has create MainWebSocketServer succ...");
        }
    });


MainWebSocketServer.on("error",function(err){
    Logger.error("MainWebSocketServer has error:"+err);
});



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
                    client.send("ok");
                    console.log(uid+" has inited succ");
                    break;
                case "enter":
                    if (channels.hasOwnProperty(channelname)) {
                        channels[channelname].push(uid);
                        client.send("ok");
                        Logger.info(uid+" has enter "+channelname);
                    } else {
                        client.send("has not the channel:" + channelname);
                    }
                    break;
                case "create":
                    if (channels.hasOwnProperty) {
                        client.send("no");
                        Logger.info(uid+" create channel fail, the channel:" + channelname + " has exist");
                    } else {
                        channels[channelname] = [];
                        client.send("ok");
                        Logger.info(udi+" create channel succ:"+channelname);
                    }
                    break;
                case "quit":
                    if (channels.hasOwnProperty(channelname)) {
                        channels[channelname] = _.without(channels[channelname], uid);
                        Logger.info(channels[channelname]);
                        client.send("ok");
                        Logger.info(uid+" has exit chanel:"+channelname+" succ");
                        if (channels[channelname].length < 1) {
                            RedisCliSub.unsubscribe(channelname);
                        }

                    } else {
                        client.send("no");
                        Logger.info("the channel:" + channelname + " has not exist");
                    }
                    break;
                default:
            }
        } else if (parseData[0] == "channel") {
            console.log(parseData[1].split("|")[1]+ "===>" +parseData[1].split("|")[0]  );

            RedisCliPub.publish(parseData[1].split("|")[0], filterCharacter(parseData[1].split("|")[1]));
        }
    });
});