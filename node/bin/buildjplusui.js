
var ModuleBuilder = require('xuld-bootjs/modulebuilder');

ModuleBuilder.build({
    basePath: require('path').resolve(__dirname, '../../../src/'),
    inputs: [require('path').resolve(__dirname, '../../../dist/jplusui.boot.js')],
    outputJs: require('path').resolve(__dirname, '../../../dist/jplusui.js'),
    outputCss: require('path').resolve(__dirname, '../../../dist/jplusui.css'),
    minify: true
});
