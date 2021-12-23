"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
const vscode = require("vscode");
const hex = require("./lib/hex");
const Range = vscode.Range;
const Selection = vscode.Selection;

/**
 * HexaDec : A Hex-Dec Converter
 */

class Context {
	constructor() {
			this.failedChanges = [];
	}
}

class Change {
	constructor(textEditor, originalSelection, transformer, originalOffset) {
			this.updatedSelectionStartOffset = -1;
			this.inputOutputLengthDelta = -1;
			this.updatedOffset = -1;
			this.input = "";
			this.output = "";
			this.textEditor = textEditor;
			this.originalSelection = originalSelection;
			this.updatedSelection = this.originalSelection;
			this.transformer = transformer;
			this.originalOffset = originalOffset;
	}

	transformText(context, edit) {
			let originalSelectionStartOffset = this.textEditor.document.offsetAt(this.originalSelection.start);
			//let originalSelectionEndOffset = this.textEditor.document.offsetAt(this.originalSelection.end);
			//let originalSelectionLength = originalSelectionEndOffset - originalSelectionStartOffset;
			this.updatedSelectionStartOffset = originalSelectionStartOffset + this.originalOffset;
			let range = new Range(this.originalSelection.start, this.originalSelection.end);
			this.input = this.textEditor.document.getText(range);
			if (this.transformer.check(this.input) == true) {
					this.output = this.transformer.transform(this.input);
			}
			else {
					this.output = this.input;
					context.failedChanges.push(this);
			}
			edit.replace(range, this.output);
			this.inputOutputLengthDelta = this.output.length - this.input.length;
			this.updatedOffset = this.originalOffset + this.inputOutputLengthDelta;
	}

	updateSelection() {
			if (this.updatedSelectionStartOffset != undefined && this.output != undefined) {
					let updatedSelectionStart = this.textEditor.document.positionAt(this.updatedSelectionStartOffset);
					let updatedSelectionEnd = this.textEditor.document.positionAt(this.updatedSelectionStartOffset + this.output.length);

					// Build and store the new selection.
					this.updatedSelection = new Selection(updatedSelectionStart, updatedSelectionEnd);
			}
	}
}

function processSelections(textEditor, edit, transformer) {
	// let document = textEditor.document;
	let changes = [];
	let updatedSelections = [];
	let context = new Context();
	textEditor.edit((editBuilder) => {
			for (let selectionIndex = 0; selectionIndex < textEditor.selections.length; selectionIndex++) {
					let selection = textEditor.selections[selectionIndex];
					let offset = 0;
					if (selectionIndex != 0) {
							let previousChange = changes[selectionIndex - 1];
							offset = previousChange.updatedOffset;
					}
					let change = new Change(textEditor, selection, transformer, offset);
					changes[selectionIndex] = change;
					change.transformText(context, editBuilder);
			}
	}).then(() => {
			for (let changeIndex = 0; changeIndex < changes.length; changeIndex++) {
					let change = changes[changeIndex];
					change.updateSelection();
					updatedSelections.push(change.updatedSelection);
			}
			textEditor.selections = updatedSelections;
	}).then(() => {
			if (context.failedChanges.length != 0) {
					let message = util.format('%s selections could not be processed.', context.failedChanges.length);
					vscode.window.showWarningMessage(message);
			}
	});
}

function selectAndApplyTransformation(textEditor, edit) {
	let transformers = [
			new hex.HexToDecTransformer(),
			new hex.DecToHexTransformer()
	];

	vscode.window.showQuickPick(transformers).then((transformer) => {
			if (transformer != undefined) {
					processSelections(textEditor, edit, transformer);
			}
	});
}

function activate(context) {
	let disposable = vscode.commands.registerTextEditorCommand('hexadec.convert', selectAndApplyTransformation);

	context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map