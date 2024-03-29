import * as path from 'path';
import { workspace, ExtensionContext, DocumentSelector, env, languages, commands } from 'vscode';

import {SvgPreviwerContentProvider, registerPreviewer} from './previewer';

const SVG_MODE : DocumentSelector = [
    {
        scheme: "file",
        language: "svg"
    },
    {
        scheme: "untitled",
        language: "svg"
    },
    {
        scheme: "file",
        language: "xml",
        pattern: "*.svg"
    }
];

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';
import { /*SvgFormattingProvider, */copyDataUri, svgMinify, svgMinifyToFile } from './commands';
import { registerPathDataHightlightProvider } from './pdl';

let client: LanguageClient;
let language = env.language;

export function activate(context: ExtensionContext) {
	SvgPreviwerContentProvider.$context = context;	
	registerPreviewer();
	context.subscriptions.push(
		// languages.registerDocumentFormattingEditProvider(SVG_MODE, new SvgFormattingProvider()),
		commands.registerTextEditorCommand('_svg.minifySvg', (textEditor, edit) => svgMinify(context, textEditor, edit)),
		commands.registerTextEditorCommand('svg.copyDataUri', copyDataUri),
		commands.registerCommand('_svg.minifySvgToFile', uri=>svgMinifyToFile(context, uri)),
		registerPathDataHightlightProvider()
	);

	let serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);
	let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };
	let serverOptions: ServerOptions = {
		run: { 
			module: serverModule, 
			transport: TransportKind.ipc
		},
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};
	let clientOptions: LanguageClientOptions = {
		documentSelector: [{
			scheme: "file",
			language: "svg"
		},
		{
			scheme: "untitled",
			language: "svg"
		}],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
	};
	client = new LanguageClient(
		'languageServerSVG',
		'Language Server SVG',
		serverOptions,
		clientOptions
	);

	client.onReady().then(()=>{
		client.sendNotification('_svg_init', {
			language : language
		});
	});

	client.start();
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
