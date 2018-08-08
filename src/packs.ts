#!/usr/bin/env node

import { join } from 'path';
import Snipacks from './class';

const json = join(process.cwd(), 'package.json');
// tslint:disable-next-line:no-var-requires
const pkg = require(json);

const env = process.env.NODE_ENV || 'dev';
const args: string[] = process.argv.slice(1).filter((i) => !/snipacks/.test(i));
const cmd = args.shift() || 'update';

const cli = new Snipacks(env, json, pkg);
cli.exec(cmd, args);
