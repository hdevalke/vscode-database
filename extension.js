
var vscode = require('vscode');
var fs = require('fs');

var Config = require('./extension/action/helpers/Config.js');
var config = new Config();

var Menager = require('./extension/Menager.js');
var menager = new Menager();

function activate(context) {

    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('sql',{
        
        provideCompletionItems(document, position, token) {
            return menager.getCompletionItem();
        },
        resolveCompletionItem(item, token) {
            return item;
        }
        
    },' '));

    config.getDatabases().then((config) => {

        if(typeof config['extension.databases'] === "undefined"){
            return;
        }
        var databases = config['extension.databases'];
        for(let index in databases){

            menager.connectPromise(databases[index].type, databases[index].host, databases[index].user, databases[index].password, databases[index].database).then((server) => {
                server.name = databases[index].name;
                menager.showStatus();
            }).catch(function(err){
                vscode.window.showErrorMessage(err);
                console.log(err);
            });
        }
    });


    addCommand(context, 'extension.queryBuild');

    addCommand(context, 'extension.runQueryBuild');

    addCommand(context, 'extension.saveConfig');
    
    addCommand(context, 'extension.changeDB');
    
    addCommand(context, 'extension.changeServer');
    
    addCommand(context, 'extension.connectToSQLServer');

    addCommand(context, 'extension.querySQL');

    addCommand(context, 'extension.runCurrentFile');

}
exports.activate = activate;

function addCommand(context, name){

    var actionClass = require('./extension/action/'+name+'.js');
    var actionObject = new actionClass(menager);
    var func = actionObject.execution.bind(actionObject);

    let command = vscode.commands.registerCommand(name, func);
    context.subscriptions.push(command);
}

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;