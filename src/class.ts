import { stat, unlink, writeFile } from 'fs';
import { join } from 'path';
import Promise from 'ts-promise';
import { checkdir, command } from './helpers';
import { fetch } from './helpers';

interface ISnipacks {
  exec: (cmd: string, args: string[]) => void;
}

export default class Snipacks implements ISnipacks {
  private env: string;
  private json: string;
  private pkg: any;

  constructor(env: string, json: string, pkg: any) {
    this.env = env;
    this.json = json;
    this.pkg = pkg;

    this.pkg.snipacks = this.pkg.snipacks || {};
    this.pkg.snipacks.dir = this.pkg.snipacks.dir || 'snipacks';
  }

  public exec(cmd: string, args: string[]): void {
    try {
      (this as any)[cmd](cmd, args);
    } catch (e) {
      console.log('\n "', cmd, '" is not a valid command! \n');
    }
  }

  private list() {
    console.log(JSON.stringify(this.pkg.snipacks, null, '  '));
  }

  private add(cmd: string, args: string[]): void {
    const [type, file, source] = args;
    const ok = command(cmd, type, file, source);

    if (ok) {
      const { snipacks } = this.pkg;
      const asset = {
        [file]: source,
      };

      snipacks[type] = snipacks[type] || {};
      snipacks[type] = { ...snipacks[type], ...asset };
      this.pkg.snipacks = snipacks;

      checkdir(snipacks.dir)
        .then((path) => fetch(path, type, asset))
        .then(this.packup.bind(this));
    }
  }

  private del(cmd: string, args: string[]) {
    const [type, file] = args;
    const ok = command(cmd, type, file);

    if (ok) {
      const { snipacks } = this.pkg;
      const path = join(snipacks.dir, type, file);
      const delfile = (done: any) => unlink(path, done);
      const delkey = () => {
        delete snipacks[type][file];
        this.packup().then(() => console.log(path, 'deleted'));
      };
      stat(path, (e) => e ? delkey() : delfile(delkey));
    }
  }

  private update() {
    const base = this.pkg.snipacks.dir;
    const dirs = Object.keys(this.pkg.snipacks).filter((k) => k !== 'dir');
    const play = /dev/i.test(this.env) ? this.packup() : Promise.resolve();

    console.log('Async fetching snippets/packages...');

    play.then(() => checkdir(base))
      .then((path) => {
        dirs.forEach((dir) => {
          fetch(path, dir, this.pkg.snipacks[dir]);
        });
      });
  }

  private packup(): Promise<any> {
    const { snipacks } = this.pkg;

    const result = Object.keys(snipacks)
      .filter((k) => k !== 'dir')
      .sort()
      .reduce((o: any, i) => {
        o[i] = Object.keys(snipacks[i])
          .sort()
          .reduce((r: any, s) => {
            r[s] = snipacks[i][s];
            return r;
          }, {});
        return o;
      }, {});

    this.pkg.snipacks = { ...snipacks, ...result };
    const json = JSON.stringify(this.pkg, null, '  ');

    return new Promise((done: any) => {
      writeFile(this.json, json, (e) => {
        if (e) {
          throw e;
        } else {
          done();
        }
      });
    });
  }
}
