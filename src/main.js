#!/usr/bin/env node

import commander from 'commander'
import pack from '../package.json'
import { list, add, update, del } from './methods'

commander.version(pack.version).description(pack.description)

commander
  .command('list')
  .description(
    'Prints `@jsweb/packs` section from `package.json`. Just for convenience!',
  )
  .action(list)

commander
  .command('add')
  .description(
    'Add new assets to your project, indexing at `@jsweb/packs` section in `package.json`',
  )
  .action(add)

commander
  .command('update')
  .description(
    'Update/fetch all assets indexed at `@jsweb/packs` section in `package.json`',
  )
  .action(update)

commander
  .command('del')
  .description(
    'Remove assets indexed at `@jsweb/packs` section in `package.json`',
  )
  .action(del)

commander.parse(process.argv)

if (!commander.args.length) {
  commander.help()
}
