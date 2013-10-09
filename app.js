require('./logs/InitLog4js'); //init log4js
require('./redisCli/redisCli'); //init redis Cli
require('./mainWsServer/mainWs'); //init main server




RedisCliSub.subscribe("channelA"); //初始订阅一些频道
RedisCliSub.subscribe("channelB");

global.clientConns = {//保存客户端链接
	//uid1:{"client":"client","lastSentTime":0}
}; 
global.administrators=["uid1","uid2"];//保存管理员uid
global.forbiddenUids=["uid1","uid2"];//保存被禁止发言的uid
global.channels = { //保存各个频道的uid
    channelA: ["uid1", "uid2"],
    channelB: ["uid1", "uid2"],
    channelC: ["uid1", "uid2"]
};