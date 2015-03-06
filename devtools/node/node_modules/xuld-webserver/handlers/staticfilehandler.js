

var FS = require('fs');

exports.init = function (application) {
	application.mimeTypes = application.mimeTypes || {
		".html": "text/html",
		".htm": "text/html",
		".css": "text/css",
		".less": "text/less",
		".js": "text/javascript",
		".txt": "text/plain",
		".xml": "text/xml",
		".png": "image/png",
		".jpg": "image/jpg",
		".jpeg": "image/jpeg",
		".gif": "image/gif",
		".svg": "image/svg",
		".ico": "image/icon",
		".mdb": null
	};
};

exports.processRequest = function (context) {
	FS.readFile(context.request.physicalPath, function(error, content) {
		if(error) {
			context.reportError(400, error);
			return;
		}
		
		var mime = context.applicationInstance.mimeTypes[context.request.filePathExtension];

		if (mime) {
		    context.response.contentType = mime;
		} else if (mime !== undefined) {
		    context.reportError(403);
		    return;
		}

		context.response.binaryWrite(content);
		context.response.end();
	});
	
	return true;
};
