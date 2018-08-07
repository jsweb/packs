"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const ts_promise_1 = __importDefault(require("ts-promise"));
const helpers_1 = require("./helpers");
const helpers_2 = require("./helpers");
class Snipacks {
    constructor(env, json, pkg) {
        this.env = env;
        this.json = json;
        this.pkg = pkg;
        this.pkg.snipacks = this.pkg.snipacks || {};
        this.pkg.snipacks.dir = this.pkg.snipacks.dir || 'snipacks';
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
        console.log(JSON.stringify(this.pkg.snipacks, null, '  '));
    }
    add(cmd, args) {
        const [type, file, source] = args;
        const ok = helpers_1.command(cmd, type, file, source);
        if (ok) {
            const { snipacks } = this.pkg;
            const asset = {
                [file]: source,
            };
            snipacks[type] = snipacks[type] || {};
            snipacks[type] = { ...snipacks[type], ...asset };
            this.pkg.snipacks = snipacks;
            helpers_1.checkdir(snipacks.dir)
                .then((path) => helpers_2.fetch(path, type, asset))
                .then(this.packup.bind(this));
        }
    }
    del(cmd, args) {
        const [type, file] = args;
        const ok = helpers_1.command(cmd, type, file);
        if (ok) {
            const { snipacks } = this.pkg;
            const path = path_1.join(snipacks.dir, type, file);
            const delfile = (done) => fs_1.unlink(path, done);
            const delkey = () => {
                delete snipacks[type][file];
                this.packup().then(() => console.log(path, 'deleted'));
            };
            fs_1.stat(path, (e) => e ? delkey() : delfile(delkey));
        }
    }
    update() {
        const base = this.pkg.snipacks.dir;
        const dirs = Object.keys(this.pkg.snipacks).filter((k) => k !== 'dir');
        const play = /dev/i.test(this.env) ? this.packup() : ts_promise_1.default.resolve();
        console.log('Async fetching snippets/packages...');
        play.then(() => helpers_1.checkdir(base))
            .then((path) => {
            dirs.forEach((dir) => {
                helpers_2.fetch(path, dir, this.pkg.snipacks[dir]);
            });
        });
    }
    packup() {
        const { snipacks } = this.pkg;
        const result = Object.keys(snipacks)
            .filter((k) => k !== 'dir')
            .sort()
            .reduce((o, i) => {
            o[i] = Object.keys(snipacks[i])
                .sort()
                .reduce((r, s) => {
                r[s] = snipacks[i][s];
                return r;
            }, {});
            return o;
        }, {});
        this.pkg.snipacks = { ...snipacks, ...result };
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
exports.default = Snipacks;
