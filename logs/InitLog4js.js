var log4js = require('log4js');
	log4js.configure({
		appenders: [{
			type: 'console'  //在客户端打印信息
		}, {
			type: 'file',//在文件中保存打印信息
			filename: './logs/dail.log',//日志位置
			maxLogSize: 1024*1024*20 //20M 日志超过了大小就会生成新的日志文件
		}],
		replaceConsole: true //console.log(),console.error()会自动转为Logger.info(),Logger.error()
	});

	global.Logger = log4js.getLogger('filelog');

	Logger.setLevel('DEBUG');//设置日志级别
	Logger.info('Logger is initialized...');