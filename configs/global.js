module.exports = {
	WSserverPort: 6789,  //本ws服务端口
	redisServerPort: 6379,   //redis服务器端口
	redisServerHost: "192.168.2.106",//redis服务器ip
	maxMesageNum:10,  //各个频道缓存信息条数
	maxSendMsgHz:1000  //发消息频率设置，单位毫秒

};