var log4js = require('log4js');
global.Logger = null;

module.exports = function() {

	/**
	  @author Showen
	  init Logger
	  **/
	log4js.configure({
		appenders: [{
			type: 'console'
		}, {
			type: 'file',
			filename: './dail.log',
			maxLogSize: 1024*1024 
		}],
		replaceConsole: true 
	});

	global.Logger = log4js.getLogger('filelog');

	Logger.setLevel('DEBUG');
	Logger.info('Logger is initialized...');

}