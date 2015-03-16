// 如果本源码被直接显示，说明使用了其它服务器。
// 本源码需要使用 devtools 自带服务器执行。
// 请执行 devtools/node/bootserver.cmd 文件，并不要关闭本窗口。

var ModuleManager = require('./modulemanager');

switch(request.queryString['cmd']){
	case 'updatemodulelist':
		ModuleManager.updateModuleList();
		//redirect(context);
		break;
	case 'createmodule':
		var html = ModuleManager.createModule(request.queryString.path, request.queryString.title);
		//redirect(context, context.request.queryString.postback || html);
		break;
	case 'deletemodule':
		ModuleManager.deleteModule(request.queryString.path);
		//redirect(context);
		break;
	case 'updatemodule':
		var moduleInfo = {
			status: request.queryString.status
		};

		if(request.queryString.support) {
			if(request.queryString.support.length !== require('../../demo/demo.js').Configs.support.length){
				moduleInfo.support = request.queryString.support.join("|");
			} else {
				moduleInfo.support = '';
			}
		}

		if(request.queryString.ignore) {
			moduleInfo.ignore = request.queryString.hide == "on";
		}

		ModuleManager.updateModuleInfo(request.queryString.path, request.queryString.title, moduleInfo);
		//redirect(context);
		break;
	case 'getlist':
		var list = ModuleManager.getModuleList(request.queryString.type || require('../../demo/demo.js').Configs.src);
		writeJsonp(context, list);
		break;
	default:
		redirect(context);
		break;

}

response.end();



function writeJsonp(context, data) {

    data = JSON.stringify(data);

    if (context.request.queryString.callback) {
        context.response.write(context.request.queryString.callback + '(' + data + ')');
    } else {
        context.response.write(data);
    }

}

function redirect(context, url) {

    url = url || context.request.queryString.postback;

    if (url) {

    	if (!/^http:/.test(url)) {
    		url = url.replace(/^file:\/\/\//, '').replace(/\\/g, "/");
            var Demo = require('../../demo/demo.js');
            url = url.replace(Demo.basePath.replace(/\\/g, "/"), Demo.Configs.serverBaseUrl);
            context.response.redirect(url);

        } else {
            context.response.redirect(url);
        }

    }

}
