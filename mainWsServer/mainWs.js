var WebSocket = require("ws"),
    configs = require("../configs/global.js"),
    verifyCli = require('../verifyCli/verifyCli').verify, //验证客户端链接
    filterCharacter = require('../filterCharacter/filterCharacter').filter, //脏字符过滤
    _ = require("underscore")._, //方便对数组等数据结构的操作
    WebSocketServer = WebSocket.Server, //创建ws服务
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


MainWebSocketServer.on("error", function(err) { //ws服务监听错误
    Logger.error("MainWebSocketServer has error:" + err);
});


MainWebSocketServer.on("connection", function(client) { //ws服务监听客户端链接
    console.log("has a client connected...");
    client.on("message", function(data, flags) {
        var parseData = data.split("|@|", 2);
        if (parseData[0] == "command") { //命令数据格式："command|@|init|uid|channelA","command|@|enter|uid|channelA"....
            console.log("has a command message");
            var userInfo = parseData[1];
            var commandAction = userInfo.split("|")[0];
            var uid = userInfo.split("|")[1];
            var channelname = userInfo.split("|")[2];
            if (!userInfo || !commandAction || !uid || !channelname) {
                console.log("command is lawless..");
                return;
            }

            if (!clientConns.hasOwnProperty(uid) && commandAction != "init") { //如果cli没有被收集、没有init
                //利用isInit和lastSendTime可以定时检测长时间没有init的cli
                clientConns[uid] = {
                    client: client,
                    lastSendTime: new Date().getTime(),
                    isInit: false
                };
                console.log("plase init it in time,otherwise will close");
                return;
            } else if (clientConns[uid] && !clientConns[uid].isInit && commandAction != "init") { //如果cli被收集但是没有init
                console.log("has not init,plase init");
                return;
            }

            switch (commandAction) {
                case "init": //初始化客户端链接信息并验证合法性
                    if (!verifyCli(data)) {
                        return;
                    }
                    clientConns[uid] = {
                        client: client,
                        lastSendTime: new Date().getTime(),
                        isInit: true
                    };
                    client.send("ok");
                    console.log(uid + " has inited succ");

                    break;
                case "enter": //进入频道
                    if (channels.hasOwnProperty(channelname)) {
                        channels[channelname].push(uid);
                        RedisCliPub.lrange("channelA", 0, configs.maxMesageNum - 1, function(err, message) { //得到缓存的频道信息
                            client.send(JSON.stringify(message));
                        });
                        client.send("ok");
                        Logger.info(uid + " has enter " + channelname);
                    } else {
                        client.send("has not the channel:" + channelname);
                    }
                    break;
                case "create": //创建频道
                    if (channels.hasOwnProperty) {
                        RedisCliSub.subscribe
                        client.send("no");
                        Logger.info(uid + " create channel fail, the channel:" + channelname + " has exist");
                    } else {
                        channels[channelname] = [];
                        client.send("ok");
                        Logger.info(udi + " create channel succ:" + channelname);
                        RedisCliSub.subscribe(channelname);
                    }
                    break;
                case "quit": //退出频道
                    if (channels.hasOwnProperty(channelname)) {
                        channels[channelname] = _.without(channels[channelname], uid);
                        Logger.info(channels[channelname]);
                        client.send("ok");
                        Logger.info(uid + " has exit chanel:" + channelname + " succ");
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
        } else if (parseData[0] == "message") { //频道消息数据格式："message|@|channelA|uid|hellword" 发送给个人的消息需要进一步区分格式
            var channelname = parseData[1].split("|")[0];
            var uid = parseData[1].split("|")[1];
            var message = parseData[1].split("|")[2];

            console.log(message + "===>" + channelname);
            if (forbiddenUids.indexOf(uid) == -1) { //检测是否被禁言
                RedisCliPub.publish(channelname, filterCharacter(parseData[1].split("|")[2])); //脏字符过滤并发布出去

                RedisCliPub.lpush(channelname, message); //更新频道缓存
                RedisCliPub.llen(channelname, function(err, n) {
                    console.log(n);
                    if (n > configs.maxMesageNum) {
                        RedisCliPub.ltrim(channelname, 0, configs.maxMesageNum - 1);
                        console.log(n);
                    }
                });
            } else {
                console.log("has been forbided..");
            }
        } else if (parseData[0] == "messageA") { //管理员发消息，活动公告等,消息数据格式："messageA|@|channelA|uid|hellword"
            var channelname = parseData[1].split("|")[0];
            var uid = parseData[1].split("|")[1];
            var message = parseData[1].split("|")[2];
            if (administrators.indexOf(uid) != -1) { //检测是否为管理员
                console.log("administrator " + uid + " send a message");
                RedisCliPub.publish(channelname, filterCharacter(parseData[1].split("|")[2])); //发布出去
            } else {
                console.warn("some people want feign administrator...");
            }
        }
    });

    client.on("close", function(code, message) { //客户端关闭
        for (var uid in clientConns) {
            if (clientConns[uid].client == client) {
                if (!message) {
                    console.log("a client closed,code:" + code + ";message:" + message);
                    channels["channelA"] = _.without(channels["channelA"], uid); //如果是异常退出,强行更新所在频道表
                    delete clientConns[uid]; //删除客户端链接
                    break;
                }
            }
        }
    });
});