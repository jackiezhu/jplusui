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
 * @param {String} path 组件的路径。
 * @param {String} [title] 组件的描述名。默认使用 *name* 作为描述 。
 */
exports.createModule = function (path, title) {

	path = Demo.Module.toModulePath(path);

	// 忽略空参数。
	if (!path) {
	    return Path.resolve(Demo.Configs.basePath, Demo.Configs.demos);
	}

	var tplFolder = Path.resolve(Demo.Configs.basePath, Demo.Configs.devTools, Demo.Configs.templatesPath);
	
    // 确定模块文件。
	var tplName = path.substr(0, path.indexOf('/'));
	var tplFile = Path.resolve(tplFolder, tplName + '.html');
	if (!IO.existsFile(tplFile)) {
	    tplName = 'tpl';
	    tplFile = Path.resolve(tplFolder, tplName + '.html');
	    if (!IO.existsFile(tplFile)) {
	        return Path.resolve(Demo.Configs.basePath, Demo.Configs.demos, path + ".html");
	    }
	}

	// 模板的 HTML 路径。
	var targetHtmlPath = Path.resolve(Demo.Configs.basePath, Demo.Configs.demos, path + Path.extname(tplFile));
	var basePathRelative = Path.relative(Path.dirname(targetHtmlPath), Demo.Configs.basePath).replace(/\\/g, "/");

	// 读取 HTML 模板内容。
	var content = IO.readFile(tplFile);

	// 如果存在 tpl.* ，则复制 tpl.* 。
	content = content.replace(/~/g, basePathRelative).replace(/tpl\.\w+/g, function (file) {
	    var fromPath = Path.resolve(tplFolder, file);
	    if (!IO.exists(fromPath)) {
	        fromPath = fromPath.replace('.css', '.less');
	        if (!IO.exists(fromPath)) {
	            return file;
	        }
		}

	    var toName = Demo.Configs.sources + "/" + path + Path.extname(file);
	    var toPath = Path.resolve(Demo.Configs.basePath, Demo.Configs.sources + "/" + path + Path.extname(fromPath));

	    if (!IO.exists(toPath)) {
	        IO.copyFile(fromPath, toPath);
	    }
			
	    return basePathRelative + "/" + toName;
	});

	if (title) {
	    content = content.replace(/<title>.*?<\/title>/, "<title>" + title + "</title>");
	}

	// 写入文件。
	if (!IO.exists(targetHtmlPath))
	    IO.writeFile(targetHtmlPath, content, Demo.Configs.encoding);

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

var reModuleInfo = new RegExp('(<meta\\s+name\\s*=\\s*([\'\"])' + Demo.Configs.moduleInfo + '\\2\\s+content\\s*=\\s*([\'\"]))(.*?)(\\3\\s*\\/?>)', 'i');

/**
 * 更新一个组件信息。
 * @param {String} module 组件的模块。
 * @param {String} category 组件的分类。
 * @param {String} title 组件的描述名。如果不需要更改，则置为 null 。
 * @param {Object} moduleInfo 组件的属性。如果不需要更改，则置为 null 。
 */
exports.updateModuleInfo = function (htmlPath, title, moduleInfo) {
	
	// 忽略空参数。
	if (!htmlPath) {
		return;
	}

	htmlPath = Path.resolve(Demo.Configs.basePath, htmlPath);
	
	if (!IO.exists(htmlPath)) {
	    return;
	}

    var content = IO.readFile(htmlPath, Demo.Configs.encoding);

    // 找到 <head>。
    var head = (/<head>([\s\S]*?)<\/head>/.exec(content) || [0, content])[1],
        oldHead = head;

    // 描述存入 <title> 标签。
    if (title) {
        if (moduleInfo && ('title' in moduleInfo)) {
            moduleInfo.title = title;
        } else {
            var titleMatch = /(<title[^\>]*?>)(.*?)(<\/title>)/.exec(head);
            if (!titleMatch) {
                head = '<title>' + title + '</title>' + head;
            } else {
                head = head.replace(titleMatch[0], titleMatch[1] + title + titleMatch[3]);
            }
        }
    }

    // moduleInfo 存入 meta 标签。
    if (moduleInfo) {
        var metaMatch = reModuleInfo.exec(head);

        if (metaMatch) {
            var oldModuleInfo = Demo.Module.parseModuleInfo(metaMatch[4]);
            require('utilskit/helpers').extend(oldModuleInfo, moduleInfo);
            moduleInfo = oldModuleInfo;
        }

        // 简化数据。
        if (!moduleInfo.support) {
            delete moduleInfo.support;
        }

        if (moduleInfo.status === "ok") {
            delete moduleInfo.status;
        }

        moduleInfo = Demo.Module.stringifyModuleInfo(moduleInfo);

        if (metaMatch) {
            head = head.replace(metaMatch[0], moduleInfo ? metaMatch[1] + moduleInfo + metaMatch[5] : "");
        } else if (moduleInfo) {
            var titleMatch = /(\s*)(<title[^\>]*?>.*?<\/title>)/m.exec(head);
            if (titleMatch) {
                head = head.replace(titleMatch[0], titleMatch[1] + '<meta name="' + Demo.Configs.moduleInfo + '" content="' + moduleInfo + '\">' + titleMatch[0]);
            } else {
                head = '<meta name="' + Demo.Configs.moduleInfo + '" content="' + moduleInfo + '\">' + head;
            }
        }

    }

    content = content.replace(oldHead, head);

    IO.writeFile(htmlPath, content, Demo.Configs.encoding);

    exports.updateModuleList();
};

/**
 * 更新指定的列表缓存文件。
 */
exports.updateModuleList = function () {

    // 生成模块列表。
    var moduleList = {
        index: [],
        demos: {},
        sources: {}
    };

    // 载入示例、分类列表。
    var root = Path.resolve(Demo.Configs.basePath, Demo.Configs.demos);
    var files = IO.getFiles(root);
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var ext = Path.extname(file);
        var moduleInfo;

        // 忽略非示例文件。
        if (!/^\.(html?|md|jade|ejs|asp|php|aspx)$/.test(ext)) {
            continue;
        }

        // 解析模块信息。
        moduleInfo = exports.getModuleInfo(Path.resolve(root, file), file);

        if (moduleInfo.ignore === "true" || moduleInfo.ignore === "1") {
            continue;
        }

        moduleList.demos[file] = moduleInfo;

        addCategory(file, moduleInfo, '');

        function addCategory(path, moduleInfo, prefix) {
            if (!path || path === '.') {
                return moduleList.index;
            }
            
            // 先添加父级分类。
            var parentChildren = addCategory(Path.dirname(path), moduleInfo, 'category.' + prefix);
            
            // 获取或创建子分类。
            var categoryInfo;
            for (var i = 0; i < parentChildren.length; i++) {
                if (parentChildren[i].path === path) {
                    categoryInfo = parentChildren[i];
                    break;
                }
            }

            // 如果不存在则立即创建一个。
            if (!categoryInfo) {
                parentChildren.push(categoryInfo = {
                    path: path,
                    name: Path.basename(path),
                    title: path
                });

                // 如果当前不是分类文件夹，不需要创建 children 级。
                if (prefix) {
                    categoryInfo.children = [];
                }
            }

            // 保存分类信息。
            if (moduleInfo[prefix + 'title']) {
                categoryInfo.title = moduleInfo[prefix + 'title'];
            }

            if (moduleInfo[prefix + 'index']) {
                categoryInfo.index = +moduleInfo[prefix + 'index'];
            }

            return categoryInfo.children;
        }

    }

    // 整理分类和索引。
    sortCategory(moduleList.index);

    function sortCategory(parentChildren) {

        parentChildren.sort(function (x, y) {
            var xIndex = x.index == null ? Infinity : x.index;
            var yIndex = y.index == null ? Infinity : y.index;
            return xIndex - yIndex;
        });

        for (var i = 0; i < parentChildren.length; i++) {
            var c = parentChildren[i].children;
            if (c) {
                sortCategory(c);
            }
        }

    }

    // 载入源码列表。
    files = IO.getFiles(Path.resolve(Demo.Configs.basePath, Demo.Configs.sources));
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var ext = Path.extname(file);

        // 忽略示例文件。
        if (!/^\.(js|css|less|styue|coffee|sass|jsx|ts)$/.test(ext)) {
            continue;
        }

        moduleList.sources[file] = ext;

    }
    delete moduleList.sources["boot.js"];

    IO.writeFile(Path.resolve(Demo.Configs.basePath, Demo.Configs.devTools, Demo.Configs.moduleListPath), 'var ModuleList=' + JSON.stringify(moduleList) + ';', Demo.Configs.encoding);
};

/**
 * 解析一个 HTML 文件内指定的组件信息。
 * @param {String} filePath 文件路径。
 */
exports.getModuleInfo = function (filePath, modulePath) {
    var content = IO.readFile(filePath, Demo.Configs.encoding);
    var match = reModuleInfo.exec(content);
    var moduleInfo = match && Demo.Module.parseModuleInfo(match[4]) || {};
    moduleInfo.title = moduleInfo.title || (/(<title[^\>]*?>)(.*?)(<\/title>)/i.exec(content) || [])[2] || modulePath;
    return moduleInfo;
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
