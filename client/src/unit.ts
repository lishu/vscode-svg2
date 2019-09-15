import fs = require('fs');
let path = require('path');

import {Uri} from 'vscode';

export function writeB64ToFile(b64: string, path: string, done: (err: NodeJS.ErrnoException | null) => void) {
    let data = Buffer.from(b64, 'base64');// new Buffer(b64, 'base64');
    fs.writeFile(path, data, e=>{
        done(e);
    });
}

export function changeName(uri: Uri, callback:(oldName: string, oldExt: string) => string) {
    let baseName = path.basename(uri.fsPath);
    let oldExt = path.extname(baseName);
    let oldName = baseName.substr(0, baseName.length - oldExt.length);
    let newPath = path.join(path.dirname(uri.fsPath), callback(oldName, oldExt));
    return Uri.file(newPath);
}