var vscode = require('vscode');
var AbstractAction = require('./AbstractAction.js');

module.exports = class runCurrentFile extends AbstractAction 
{
    execution() {
        if (!this.preconditions()) {
            return;
        }

        const sql = vscode.window.activeTextEditor.document.getText();
        const result = sql.split(/(DELIMITER\s+\S+)/ig);
        let delimiter = ';';

        for (const part of result) {
            const newDelimiter = (/DELIMITER\s+(\S+)/i).exec(part);
            if (newDelimiter === null) {
                const queries = part.split(delimiter);
                for (const query of queries) {
                    this.execQuery(query);
                }
            } else {
                [, delimiter] = newDelimiter;
            }
        }
    }

    preconditions() {
        if (this.sqlMenager.currentServer === null) {
            vscode.window.showInformationMessage("You are currently not connected to the server");
            return false;
        }
        return true;
    }

    execQuery(query) {
        if (!(/^\s*$/).test(query)) {
            this.sqlMenager.query(query);
        }
    }
}