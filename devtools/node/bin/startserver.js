
var HttpServer = require("xuld-webserver/lib/httpserver");

var server = new HttpServer({
    "port": 5370,
    "physicalPath": "../../../../"
});

server.on('start', function () {
    console.log("[info]Server running at " + this.rootUrl);
});

server.on('stop', function () {
    console.log("[info]Server stopped at " + this.rootUrl);
});

server.on('error', function (e) {
    if (e.code == 'EADDRINUSE') {
        console.error('[Error]Cannot create server on port ' + this.port + (this.address && this.address !== '0.0.0.0' ? ' of ' + this.address : ''));
    } else {
        console.error(e);
    }
});

server.start();

module.exports = server;