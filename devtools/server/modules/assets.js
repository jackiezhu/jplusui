/**
 * 用于支持 http://localhost/xfly/ 可以访问系统文件夹的文件。
 * @author xuld
 */

exports.init = function (application){
	application.virtualPaths["/xfly"] = require('path').resolve(__dirname, '../../');
};
