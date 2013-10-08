require('./logs/InitLog4js'); //init log4js
require('./mainWsServer/mainWs'); //init main server
require('./redisCli/redisCli'); //init redis Cli



RedisCliSub.subscribe("channelA"); //subscribe some channel
RedisCliSub.subscribe("channelB");

global.clientConns = {}; //store WsCli

global.channels = { //store uid for channel
    channelA: ["uid1", "uid2"],
    channelB: ["uid1", "uid2"],
    channelC: ["uid1", "uid2"]
};