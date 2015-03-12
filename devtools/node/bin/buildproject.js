var ProjectBuilder = require('xuld-bootjs/projectbuilder');
ProjectBuilder.build({
    from: process.args[2],
    to: process.args[3] || 'dest/'
});