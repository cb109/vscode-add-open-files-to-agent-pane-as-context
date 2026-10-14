const vscode = require('vscode');

function getOpenTabUris() {
	const skipPinned = vscode.workspace
		.getConfiguration('addOpenFilesToAgentContext')
		.get('skipPinnedTabs', true);
	const uris = new Map();
	for (const group of vscode.window.tabGroups.all) {
		for (const tab of group.tabs) {
			if (skipPinned && tab.isPinned) {
				continue;
			}
			const input = tab.input;
			let uri;
			if (input instanceof vscode.TabInputText
				|| input instanceof vscode.TabInputNotebook
				|| input instanceof vscode.TabInputCustom) {
				uri = input.uri;
			} else if (input instanceof vscode.TabInputTextDiff
				|| input instanceof vscode.TabInputNotebookDiff) {
				uri = input.modified;
			}
			if (uri) {
				uris.set(uri.toString(), uri);
			}
		}
	}
	return [...uris.values()];
}

function activate(context) {
	context.subscriptions.push(
		vscode.commands.registerCommand('addOpenFilesToAgentContext.run', async () => {
			const files = getOpenTabUris();
			if (files.length === 0) {
				vscode.window.showInformationMessage('No open files to add.');
				return;
			}

			await vscode.commands.executeCommand('workbench.action.chat.newChat');
			await vscode.commands.executeCommand('workbench.action.chat.open', {
				mode: 'agent',
				query: '',
				isPartialQuery: true,
				attachFiles: files,
			});
		})
	);
}

function deactivate() { }

module.exports = { activate, deactivate };
