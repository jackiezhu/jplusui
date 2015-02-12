

exports.processRequest = function  (context) {
	context.response.write("settings");
	context.response.end();
};