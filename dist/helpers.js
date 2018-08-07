"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const mkdirp_1 = __importDefault(require("mkdirp"));
const path_1 = require("path");
const request_1 = __importDefault(require("request"));
const ts_promise_1 = __importDefault(require("ts-promise"));
const package_json_1 = __importDefault(require("../package.json"));
const base = {
    gist: 'https://gist.githubusercontent.com',
    gitlab: 'https://gitlab.com/snippets',
    unpkg: 'https://unpkg.com',
};
function command(cmd, ...args) {
    for (const arg of args) {
        if (typeof arg === 'object') {
            return console.log('Incorrect use of "', cmd, '" command.', 'Run "', package_json_1.default.name, '-h " to know more.');
        }
    }
    return true;
}
exports.command = command;
function checkdir(dir) {
    const path = path_1.join(process.cwd(), dir);
    return new ts_promise_1.default((done) => {
        fs_1.stat(path, (e) => e ? mkdirp_1.default(path, () => done(path)) : done(path));
    });
}
exports.checkdir = checkdir;
function getfile(url, dir, sub, out) {
    const path = path_1.join(dir, sub);
    const file = path_1.join(path, out);
    const lock = file.replace(process.cwd(), '');
    const req = () => request_1.default(url)
        .pipe(fs_1.createWriteStream(file))
        .on('close', () => {
        console.log(lock, 'saved');
    })
        .on('error', (e) => console.error(e));
    fs_1.stat(path, (e) => e ? mkdirp_1.default(path, req) : req());
}
exports.getfile = getfile;
function fetch(dir, type, assets) {
    Object.keys(assets).forEach((file) => {
        const web = type === 'web';
        const raw = /^gis?t/.test(type);
        const src = web ? assets[file] : `${base[type]}/${assets[file]}`;
        const url = raw ? `${src}/raw` : src;
        getfile(url, dir, type, file);
    });
}
exports.fetch = fetch;