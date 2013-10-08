var log4js = require('log4js');
	log4js.configure({
		appenders: [{
			type: 'console'
		}, {
			type: 'file',
			filename: './logs/dail.log',
			maxLogSize: 1024*1024 
		}],
		replaceConsole: true 
	});

	global.Logger = log4js.getLogger('filelog');

	Logger.setLevel('DEBUG');
	Logger.info('Logger is initialized...');