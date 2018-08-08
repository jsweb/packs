"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const ts_promise_1 = __importDefault(require("ts-promise"));
const helpers_1 = require("./helpers");
class JSWebPacks {
    get pack() {
        return /dev/i.test(this.env) ? this.packup : ts_promise_1.default.resolve;
    }
    constructor(env, json, pkg) {
        this.env = env;
        this.json = json;
        this.pkg = pkg;
        this.pkg['@jsweb/packs'] = this.pkg['@jsweb/packs'] || {};
        this.pkg['@jsweb/packs'].dir = this.pkg['@jsweb/packs'].dir || 'jsweb-packs';
    }
    exec(cmd, args) {
        try {
            this[cmd](cmd, args);
        }
        catch (e) {
            console.log('\n "', cmd, '" is not a valid command! \n');
        }
    }
    list() {
        console.log(JSON.stringify(this.pkg['@jsweb/packs'], null, '  '));
    }
    add(cmd, args) {
        const [type, file, source] = args;
        const ok = helpers_1.command(cmd, type, file, source);
        if (ok) {
            const packs = this.pkg['@jsweb/packs'];
            const asset = {
                [file]: source,
            };
            packs[type] = packs[type] || {};
            packs[type] = { ...packs[type], ...asset };
            this.pkg['@jsweb/packs'] = packs;
            helpers_1.checkdir(packs.dir)
                .then((path) => helpers_1.fetch(path, type, asset))
                .then(this.pack.bind(this));
        }
    }
    del(cmd, args) {
        const [type, file] = args;
        const ok = helpers_1.command(cmd, type, file);
        if (ok) {
            const packs = this.pkg['@jsweb/packs'];
            const delkey = (lock) => {
                delete packs[type][file];
                this.pkg['@jsweb/packs'] = packs;
                this.pack().then(() => console.log(lock, 'deleted'));
            };
            helpers_1.checkdir(packs.dir)
                .then((path) => helpers_1.exists(path, type, file))
                .then((resp) => {
                if (resp.error) {
                    delkey(resp.lock);
                }
                else {
                    helpers_1.delfile(resp.target, delkey, resp.lock);
                }
            });
        }
    }
    update() {
        const packs = this.pkg['@jsweb/packs'];
        const dirs = Object.keys(packs).filter((k) => k !== 'dir');
        console.log('Async fetching snippets/packages...');
        helpers_1.checkdir(packs.dir)
            .then((path) => {
            dirs.forEach((dir) => {
                if (dir === 'bundle') {
                    helpers_1.bundle(path, dir, packs[dir]);
                }
                else {
                    helpers_1.fetch(path, dir, packs[dir]);
                }
            });
        })
            .then(this.pack.bind(this));
    }
    packup() {
        const packs = this.pkg['@jsweb/packs'];
        const { dir } = packs;
        const result = Object.keys(packs)
            .filter((k) => k !== 'dir')
            .sort()
            .reduce((o, i) => {
            o[i] = Object.keys(packs[i])
                .sort()
                .reduce((r, s) => {
                r[s] = packs[i][s];
                return r;
            }, {});
            return o;
        }, {});
        this.pkg['@jsweb/packs'] = { dir, ...result };
        const json = JSON.stringify(this.pkg, null, '  ');
        return new ts_promise_1.default((done) => {
            fs_1.writeFile(this.json, json, (e) => {
                if (e) {
                    throw e;
                }
                else {
                    done();
                }
            });
        });
    }
}
exports.default = JSWebPacks;
