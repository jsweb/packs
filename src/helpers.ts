import { createWriteStream, stat, unlink, writeFile } from 'fs';
import mkdirp from 'mkdirp';
import { join } from 'path';
import request from 'request';
import Promise from 'ts-promise';
import pkg from '../package.json';

const base: any = {
  gist: 'https://gist.githubusercontent.com',
  gitlab: 'https://gitlab.com/snippets',
  unpkg: 'https://unpkg.com',
};

export function command(cmd: string, ...args: any[]): boolean | void {
  for (const arg of args) {
    if (typeof arg === 'object') {
      return console.log(
        'Incorrect use of "', cmd, '" command.',
        'Run "', pkg.name, '-h " to know more.',
      );
    }
  }

  return true;
}

export function checkdir(dir: string): Promise<any> {
  const path = join(process.cwd(), dir);
  return new Promise((done: any) => {
    stat(path, (e) => e ? mkdirp(path, () => done(path)) : done(path));
  });
}

export function getfile(
  url: string,
  dir: string,
  sub: string,
  out: string,
): void {
  const path = join(dir, sub);
  const file = join(path, out);
  const lock = file.replace(process.cwd(), '');
  const req = () => request(url)
    .pipe(createWriteStream(file))
    .on('close', () => {
      console.log(lock, 'saved');
    })
    .on('error', (e) => console.error(e));

  stat(path, (e) => e ? mkdirp(path, req) : req());
}

export function fetch(
  dir: string,
  type: string,
  assets: { [key: string]: string },
): void {
  Object.keys(assets).forEach((file) => {
    const web = type === 'web';
    const raw = /^gis?t/.test(type);

    const src = web ? assets[file] : `${base[type]}/${assets[file]}`;
    const url = raw ? `${src}/raw` : src;

    getfile(url, dir, type, file);
  });
}

export function get(url: string) {
  return new Promise((done, fail) => {
    request.get(url, (e, res, body) => e ? fail(e) : done(body));
  }).catch((e) => console.error(e));
}

export function bundle(
  dir: string,
  type: string,
  assets: { [key: string]: string[] },
): void {
  const path = join(dir, type);
  const req = () =>
    Object.keys(assets).forEach((out) => {
      const file = join(dir, type, out);
      const lock = file.replace(process.cwd(), '');

      Promise
        .all(assets[out].map(get))
        .then((codes) => {
          const code = codes.join('\n').replace(/\/\/#.+\.map\s/g, '');
          writeFile(file, code, () => {
            console.log(lock, 'saved');
          });
        });
    });

  stat(path, (e) => e ? mkdirp(path, req) : req());
}

export function exists(
  path: string,
  type: string,
  file: string,
): Promise<any> {
  const target = join(path, type, file);
  const lock = target.replace(process.cwd(), '');
  return new Promise((done) => {
    stat(target, (error) => {
      return error ? done({ error, target, lock }) : done({ target, lock });
    });
  });
}

export function delfile(
  target: string,
  done: any,
  lock: string,
): void {
  unlink(target, () => done(lock));
}
