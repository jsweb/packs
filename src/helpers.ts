import { createWriteStream, stat } from 'fs';
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
) {
  Object.keys(assets).forEach((file) => {
    const web = type === 'web';
    const raw = /^gis?t/.test(type);

    const src = web ? assets[file] : `${base[type]}/${assets[file]}`;
    const url = raw ? `${src}/raw` : src;

    getfile(url, dir, type, file);
  });
}
