/**
 * 用于启动 apps 的入口模块
 * @author xuld
 */

exports.init = function (application) {
	application.apps = application.apps || {};
	application.loadModules(application.apps);
};

exports.processRequest = function  (context) {
	var path = context.request.path;
	var appName = path.substr(path.lastIndexOf('/') + 1);
	
	var app = context.applicationInstance.apps[appName];
	if(!app) {
		return false;
	}

	return app.processRequest(context, path.substr(0, path.length - appName.length - 1)) !== false;
};