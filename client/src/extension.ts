import * as path from 'path';
import { workspace, ExtensionContext, DocumentSelector, env } from 'vscode';

import {SvgPreviwerContentProvider} from './previewer';

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
} from 'vscode-languageclient';

let client: LanguageClient;
let language = env.language;

export function activate(context: ExtensionContext) {
	context.subscriptions.push(
		new SvgPreviwerContentProvider(context)
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
		documentSelector: [{ scheme: 'file', language: 'svg' }],
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
