/**
 * @fileOverview 文档系统驱动文件。此文件同时运行于浏览器及 node。
 * @author xuld
 */

// #region 前后台公用的部分

var Doc = Doc || {};

/**
 * 全局配置。
 */
Doc.Configs = {

    /**
     * 当前服务器使用的端口。
     */
    port: 5373,

    /**
     * 当前项目的基础路径。
     */
    basePath: '../../',

    /**
	 * 存放源文件的文件夹。
	 */
    sources: "src",

    /**
	 * 存放文档文件的文件夹。
	 */
    demos: "demo",

    /**
	 * 存放开发系统文件的文件夹。
	 */
    devTools: "devtools",

    /**
	 * 存放模块列表路径的地址。
	 */
    moduleListPath: 'assets/data/modulelist.js',

    /**
	 * 存放模块列表路径的地址。
	 */
    templatesPath: 'assets/templates',

    /**
	 * 存放用于处理前端请求的接口地址。
	 */
    serviceApiPath: 'node/service/api.njs',

    /**
	 * 存放数据字段的 meta 节点。
	 */
    moduleInfo: 'module-info',

    /**
	 * 整个项目标配使用的编码。
	 */
    encoding: 'utf-8',

    /**
	 * 组件访问历史最大值。
	 */
    maxHistory: 10,

    /**
	 * 工具的下拉菜单 HTML 模板。
	 */
    tools: '<a href="~/devtools/node/modulebuilder/index.html" target="_blank">模块打包工具</a>\
                <a href="~/devtools/tools/codehelper/index.html" target="_blank">代码工具</a>\
                <a href="~/devtools/tools/codesegments/specialcharacters.html" target="_blank">特殊字符</a>\
                <a href="~/devtools/tools/codesegments/regexp.html" target="_blank">常用正则</a>\
                <!--<a href="~/resources/index.html#tool" target="_blank">更多工具</a>-->\
                <a href="javascript://显示或隐藏页面中自动显示的源码片段" onclick="Demo.Page.toggleSources()" style="border-top: 1px solid #EBEBEB;">折叠代码</a>\
                <a href="javascript://浏览当前页面的源文件" onclick="Demo.Page.exploreSource();">浏览源文件</a>\
	            <!--<a href="~/resources/cookbooks/jplusui-full-api/index.html" target="_blank">jPlusUI API 文档</a>\
                <a href="~/resources/cookbooks/jplusui-core-api/index.html" target="_blank">jPlusUI Core 文档</a>\
                <a href="~/resources/cookbooks/jquery2jplus.html" target="_blank">jQuery 转 jPlusUI</a>-->\
                <!--<a href="~/resources/cookbooks/dplsystem.html" target="_blank" style="border-top: 1px solid #EBEBEB;">模块开发教程</a>-->\
				<a href="~/dev/cookbooks/apps.html" target="_blank">开发系统文档</a>\
                <!--<a href="~/resources/cookbooks/classdiagram" target="_blank">类图</a>-->\
                <a href="~/dev/index.html" target="_blank" style="border-top: 1px solid #EBEBEB;">更多文档</a>',

    /**
	 * 底部 HTML 模板。
	 */
    footer: '<footer class="demo" style="margin-bottom: 36px; font-size: 12px; line-height: 18px;">\
        <hr class="demo">\
        <nav class="demo-toolbar">\
            <a href="https://www.github.com/jplusui/jplusui">GitHub</a>  |  \
            <a href="#">返回顶部</a>\
        </nav>\
        <span>&copy; 2011-2015 JPlusUI Team</span>\
    </footer>',

    /**
	 * 合法的状态值。
	 */
    status: {
        'stable': '稳定版',
        'release': '正式版',
        'beta': '测试版',
        'plan': '计划中',
        'develop': '开发中',
        'obsolete': '已废弃'
    },

    /**
	 * 合法的浏览器。
	 */
    support: 'PC端|移动端|兼容IE6+'.split('|'),

};

Demo.Module = {

    /**
     * 获取当前页面指定的控件的信息。
     */
    parseModuleInfo: function (value) {
        var r = {};
        value = value.split(/,\s*/);
        for (var i = 0; i < value.length; i++) {
            var t = value[i],
			    s = t.indexOf('=');
            r[t.substr(0, s)] = t.substr(s + 1);
        }
        return r;
    },

    /**
     * 获取当前页面指定的控件的信息。
     */
    stringifyModuleInfo: function (value) {
        var r = [];
        for (var key in value) {
            r.push(key + '=' + value[key]);
        }
        return r.join(', ');
    },

    /**
     * 将 URL 转换为模块名。
     */
    toModulePath: function (path) {
        return path ? path.replace(/[?#].*$/, "").replace(/\.[a-zA-Z]+$/, "").replace(/^[\/\\]+/, "").replace(/[\/\\]+$/, "") : "";
    }

};

//#endregion
