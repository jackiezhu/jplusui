var ProjectBuilder = require('../projectbuilder');
ProjectBuilder.build({
    from: process.args[1],
    to: process.args[2] || 'dest/'
});