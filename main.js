#!/usr/bin/env node

import { program } from 'commander'
import pack from './package.json' assert { type: 'json' }
import { list, add, update, del } from './methods.js'

program
  .name('packs')
  .version(pack.version)
  .description(pack.description)
  .usage('[command] [...args]')

program
  .command('list')
  .description(
    'Prints `@jsweb/packs` section from `package.json`. Just for convenience!',
  )
  .action(list)

program
  .command('add')
  .description(
    'Add new assets to your project, indexing at `@jsweb/packs` section in `package.json`',
  )
  .arguments('<type> <dest> <source>')
  .action(add)

program
  .command('update')
  .description(
    'Fetches all assets indexed at `@jsweb/packs` section in `package.json`',
  )
  .action(update)

program
  .command('del')
  .description(
    'Remove assets indexed at `@jsweb/packs` section in `package.json`',
  )
  .arguments('<type> <file>')
  .action(del)

program.parse()

if (!program.args.length) program.help()
