import { writeFile } from 'fs';
import Promise from 'ts-promise';
import { bundle, checkdir, command, delfile, exists, fetch } from './helpers';

interface IWebPacks {
  exec: (cmd: string, args: string[]) => void;
}

export default class JSWebPacks implements IWebPacks {
  private env: string;
  private json: string;
  private pkg: any;

  get pack() {
    return /dev/i.test(this.env) ? this.packup : Promise.resolve;
  }

  constructor(env: string, json: string, pkg: any) {
    this.env = env;
    this.json = json;
    this.pkg = pkg;

    this.pkg['@jsweb/packs'] = this.pkg['@jsweb/packs'] || {};
    this.pkg['@jsweb/packs'].dir = this.pkg['@jsweb/packs'].dir || 'jsweb-packs';
  }

  public exec(cmd: string, args: string[]): void {
    try {
      (this as any)[cmd](cmd, args);
    } catch (e) {
      console.log('\n "', cmd, '" is not a valid command! \n');
    }
  }

  private list() {
    console.log(JSON.stringify(this.pkg['@jsweb/packs'], null, '  '));
  }

  private add(cmd: string, args: string[]): void {
    const [type, file, source] = args;
    const ok = command(cmd, type, file, source);

    if (ok) {
      const packs = this.pkg['@jsweb/packs'];
      const asset = {
        [file]: source,
      };

      packs[type] = packs[type] || {};
      packs[type] = { ...packs[type], ...asset };
      this.pkg['@jsweb/packs'] = packs;

      checkdir(packs.dir)
        .then((path) => fetch(path, type, asset))
        .then(this.pack.bind(this));
    }
  }

  private del(cmd: string, args: string[]) {
    const [type, file] = args;
    const ok = command(cmd, type, file);

    if (ok) {
      const packs = this.pkg['@jsweb/packs'];
      const delkey = (lock: string) => {
        delete packs[type][file];
        this.pkg['@jsweb/packs'] = packs;
        this.pack().then(() => console.log(lock, 'deleted'));
      };

      checkdir(packs.dir)
        .then((path) => exists(path, type, file))
        .then((resp) => {
          if (resp.error) {
            delkey(resp.lock);
          } else {
            delfile(resp.target, delkey, resp.lock);
          }
        });
    }
  }

  private update() {
    const packs = this.pkg['@jsweb/packs'];
    const dirs = Object.keys(packs).filter((k) => k !== 'dir');

    console.log('Async fetching snippets/packages...');

    checkdir(packs.dir)
      .then((path) => {
        dirs.forEach((dir) => {
          if (dir === 'bundle') {
            bundle(path, dir, packs[dir]);
          } else {
            fetch(path, dir, packs[dir]);
          }
        });
      })
      .then(this.pack.bind(this));
  }

  private packup(): Promise<any> {
    const packs = this.pkg['@jsweb/packs'];
    const { dir } = packs;

    const result = Object.keys(packs)
      .filter((k) => k !== 'dir')
      .sort()
      .reduce((o: any, i) => {
        o[i] = Object.keys(packs[i])
          .sort()
          .reduce((r: any, s) => {
            r[s] = packs[i][s];
            return r;
          }, {});
        return o;
      }, {});

    this.pkg['@jsweb/packs'] = { dir, ...result };
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
