/**
 * @fileOverview 用于增删模块和生成模块列表。
 * @author xuld
 */

var Demo = require('../../assets/demo.js'),
	Path = require('path'),
	IO = require('utilskit/io'),
	FS = require('fs');

/**
 * 新建一个模块。
 * @param {String} module 组件的模块。
 * @param {String} category 组件的分类。
 * @param {String} name 组件的名字。
 * @param {String} [title] 组件的描述名。默认使用 *name* 作为描述 。
 */
exports.createModule = function (path, tpl, title) {

	path = Demo.Module.toModulePath(path);

	// 忽略空参数。
	if (!path) {
		return Path.resolve(Demo.basePath, Demo.Configs.examples);
	}

	var tplFolder = Path.resolve(Demo.basePath, Demo.Configs.apps, "data/templates");

	// 获取模板文件夹。
	var tplFile = getFileByName(Path.resolve(tplFolder, tpl));
	
	if (!IO.existsFile(tplFile)) {
		return Path.resolve(Demo.basePath, Demo.Configs.examples, path + ".html");
	}

	// 模板的 HTML 路径。
	var targetHtmlPath = Path.resolve(Demo.basePath, Demo.Configs.examples, path + Path.extname(tplFile));

	var basePathRelative = Path.relative(Path.dirname(targetHtmlPath), Demo.basePath).replace(/\\/g, "/");

	// 读取 HTML 模板内容。
	var text = IO.readFile(tplFile);

	// 如果存在 tpl.* ，则复制 tpl.* 。
	text = text.replace(/~/g, basePathRelative).replace(/tpl\.\w+/g, function (file) {
		var fromPath = Path.resolve(tplFolder, file);
		if (IO.exists(fromPath)) {
			var toName = Demo.Configs.src + "/" + path + Path.extname(file);
			var toPath = Path.resolve(Demo.basePath, toName);

			if (!IO.exists(toPath))
				IO.copyFile(fromPath, toPath);
			return basePathRelative + "/" + toName;
		}

		return file;

	});

	if (title) {
		text = text.replace(/<title>.*?<\/title>/, "<title>" + title + "</title>");
	}

	// 写入文件。
	if (!IO.exists(targetHtmlPath))
		IO.writeFile(targetHtmlPath, text, Demo.Configs.encoding);

	exports.updateModuleList();

	return targetHtmlPath;

};

/**
 * 删除一个组件文件。
 * @param {String} module 组件的模块。
 * @param {String} category 组件的分类。
 * @param {String} name 组件的名字。
 */
exports.deleteModule = function (path) {

	path = Demo.Module.toModulePath(path);

	// 忽略空参数。
	if (!path) {
		return;
	}

	deleteFileByName(Path.resolve(Demo.basePath, Demo.Configs.examples, path));
	deleteFileByName(Path.resolve(Demo.basePath, Demo.Configs.src, path));

	exports.updateModuleList();

};

/**
 * 更新一个组件的属性。
 * @param {String} module 组件的模块。
 * @param {String} category 组件的分类。
 * @param {String} name 组件的名字。
 * @param {String} [title] 组件的描述名。如果不需要更改，则置为 null 。
 * @param {Object} [dplInfo] 组件的属性。如果不需要更改，则置为 null 。
 */
exports.updateModuleInfo = function (htmlPath, title, dplInfo) {
	
	// 忽略空参数。
	if (!htmlPath) {
		return;
	}

	htmlPath = Path.resolve(Demo.basePath, htmlPath.replace(/^[\/\\]+/, ""));
	
	if (IO.exists(htmlPath)) {

		// 整个 HTML 的源码。
		var text = IO.readFile(htmlPath, Demo.Configs.encoding);

		// 找到 <head>。
		var head = (/<head>([\s\S]*?)<\/head>/.exec(text) || [0, text])[1], oldHead = head;

		// 描述存入 <title> 标签。
		if (title) {

			if (dplInfo && ('title' in dplInfo)) {
				dplInfo.title = title;
			} else {
				var titleMatch = /(<title[^\>]*?>)(.*?)(<\/title>)/.exec(head);
				if (!titleMatch) {
					head = '<title>' + title + '</title>' + head;
				} else {
					head = head.replace(titleMatch[0], titleMatch[1] + title + titleMatch[3]);
				}
			}
		}

		// dplInfo 存入 meta 标签。
		if (dplInfo) {
			var metaMatch = new RegExp('(<meta\\s+name\\s*=\\s*([\'\"])' + Demo.Configs.metaModuleInfo + '\\2\\s+content\\s*=\\s*([\'\"]))(.*?)(\\3\\s*\\/?>\\s*)').exec(head);

			if (!metaMatch) {

				if (!dplInfo.support) {
					delete dplInfo.support;
				}

				if (dplInfo.status == "ok") {
					delete dplInfo.status;
				}

				dplInfo = Demo.Module.stringifyModuleInfo(dplInfo);

				if (dplInfo) {

					var titleMatch = /(\s*)(<title[^\>]*?>.*?<\/title>)/m.exec(head);

					if (!titleMatch) {
						head = '<meta name="' + Demo.Configs.metaModuleInfo + '" content="' + dplInfo + '\">' + head;
					} else {
						head = head.replace(titleMatch[0], titleMatch[1] + '<meta name="' + Demo.Configs.metaModuleInfo + '" content="' + dplInfo + '\">' + titleMatch[0]);
					}

				}

			} else {

				var oldModuleInfo = Demo.Module.parseModuleInfo(metaMatch[4]);
				require('../../node/node_modules/utilskit/helpers').extend(oldModuleInfo, dplInfo);

				if (!oldModuleInfo.support) {
					delete oldModuleInfo.support;
				}

				if (oldModuleInfo.status == "ok") {
					delete oldModuleInfo.status;
				}

				dplInfo = Demo.Module.stringifyModuleInfo(oldModuleInfo);
				if (dplInfo) {
					head = head.replace(metaMatch[0], metaMatch[1] + dplInfo + metaMatch[5]);
				} else {
					head = head.replace(metaMatch[0], "");
				}



			}

		}

		text = text.replace(oldHead, head);

		IO.writeFile(htmlPath, text, Demo.Configs.encoding);

		exports.updateModuleList();
	}

};

/**
 * 解析一个 HTML 文件内指定的组件信息。
 * @param {String} filePath 文件路径。
 */
exports.getModuleInfo = function(filePath, modulePath) {
    var content = IO.readFile(filePath, Demo.Configs.encoding);
    var match = new RegExp('(<meta\\s+name\\s*=\\s*([\'\"])' + Demo.Configs.metaModuleInfo + '\\2\\s+content\\s*=\\s*([\'\"]))(.*?)(\\3\\s*\\/?>)', 'i').exec(content);
    var moduleInfo = match && Demo.Module.parseModuleInfo(match[4]) || {};
    moduleInfo.path = moduleInfo.path || modulePath;
    moduleInfo.name = moduleInfo.name || (/(<title[^\>]*?>)(.*?)(<\/title>)/i.exec(content) || [])[2] || moduleInfo.path;
    moduleInfo.status = moduleInfo.status || 'ok';
    moduleInfo.ignore = moduleInfo.ignore === "true" ||  moduleInfo.ignore === "1";
    return moduleInfo;
};

/**
 * 更新指定的列表缓存文件。
 */
exports.updateModuleList =  function(){
    var moduleList = {};
    this.loadModuleList(moduleList, Demo.Configs.demo);
    this.loadModuleList(moduleList, Demo.Configs.src);
    delete moduleList["boot.js"];

    IO.writeFile(Path.resolve(Demo.basePath, Demo.Configs.devtools, Demo.Configs.moduleListPath), 'var ModuleList=' + JSON.stringify(moduleList) + ';', Demo.Configs.encoding);
};

/**
 * 重新搜索模块并返回模块列表。
 * @param {Object} moduleList 返回 JSON 格式如： {'path0': attributes1, 'path1': attributes2}
 * @param {String} folder 搜索的文件夹。
 */
exports.loadModuleList = function (moduleList, folder) {

    var root = Path.resolve(Demo.basePath, folder);
    var files = IO.getFiles(root);

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var ext = Path.extname(file);
        var moduleInfo;

        if (/^\.(html?|md|jade|ejs|asp|php|aspx)$/.test(ext)) {
            moduleInfo = exports.getModuleInfo(Path.resolve(root, file), file);
            moduleInfo.type = 'demo';
        } else {
            moduleInfo = {
                type: ext
            };
        }

        if (!moduleInfo.ignore) {
            moduleList[file] = moduleInfo;
        }

    }

};

function getFileByName(path) {
	var folder = Path.dirname(path);
	var name = Path.basename(path, ".html");
	var files = FS.readdirSync(folder);
	for (var i = 0; i < files.length; i++) {
		if (files[i] === name + Path.extname(files[i])) {
			return Path.resolve(folder, files[i]);
		}
	}
}

function deleteFileByName(path) {
	var folder = Path.dirname(path);
	var name = Path.basename(path, ".html");
	var files = FS.readdirSync(folder);
	for(var i = 0; i < files.length; i++) {
		if (files[i] === name + Path.extname(files[i])) {
			IO.deleteFile(Path.resolve(folder, files[i]));
		}
	}
}
