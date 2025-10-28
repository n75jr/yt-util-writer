import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.workspace.onDidChangeTextDocument(event => {
		const editor = vscode.window.activeTextEditor;

		if (!editor || editor.document !== event.document) {
			return;
		}

		const visibleRanges = editor.visibleRanges;
		const lastVisibleLine = visibleRanges[visibleRanges.length - 1]?.end.line;
		const totalLines = editor.document.lineCount;

		// Проверяем: есть ли что прокручивать вниз
		if (lastVisibleLine !== undefined && lastVisibleLine < totalLines - 1) {
			const lastLine = totalLines - 1;
			const lastLineLength = editor.document.lineAt(lastLine).text.length;
			const position = new vscode.Position(lastLine, lastLineLength);
			editor.selection = new vscode.Selection(position, position);
			editor.revealRange(
				new vscode.Range(position, position),
				vscode.TextEditorRevealType.Default
			);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
