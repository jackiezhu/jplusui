
var ModuleBuilder = require('xuld-bootjs/modulebuilder');

var files = {};

ModuleBuilder.build({
    inputs: [process.args[1]],
    outputJs: process.args[2] || 'build/output.js',
    outputCss: process.args[3] || 'build/output.css',
    minify: true
});
