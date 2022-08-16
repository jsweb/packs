import { join } from 'path'
import { writeFileSync, unlinkSync, readFileSync } from 'fs'

import mkdirp from 'mkdirp'
import fetch from 'node-fetch'

// Env
const root = process.cwd()
const env = process.env.NODE_ENV || 'dev'
const dev = /dev/i.test(env)

// Package
const pkg = join(root, 'package.json')
const json = readFileSync(pkg, 'utf8')
const pkgjson = JSON.parse(json)

// @jsweb/packs
const packs = pkgjson['@jsweb/packs'] || {}
const types = {
  gist: 'https://gist.githubusercontent.com',
  gitlab: 'https://gitlab.com/-/snippets',
  unpkg: 'https://unpkg.com',
  web: null,
}

export function list() {
  const list = JSON.stringify(packs, null, 2)
  console.log(list)
}

export async function add(cmd, args) {
  if (!valid(args, 3)) return false

  const [type, dest, source] = args
  const lib = packup(type, dest, source)

  try {
    await download(lib.dir, type, dest, source)
    downlog(lib.dir, type, dest)
    if (dev) rewrite(lib)
  } catch (error) {
    console.error(error)
  }
}

export async function update() {
  const index = collection()

  if (!index.length)
    return console.log('\n', '⚠ No files to fetch! Try add some stuff.', '\n')

  index.forEach((type) => {
    Object.keys(packs[type]).forEach(async (dest) => {
      const source = packs[type][dest]
      const lib = packup(type, dest, source)

      await download(lib.dir, type, dest, source)
      downlog(lib.dir, type, dest)

      if (dev) rewrite(lib)
    })
  })
}

export function del(cdm, args) {
  if (!valid(args, 2)) return false

  const [type, file] = args

  if (!packs[type])
    return console.log('\n', '⚠ No files indexed at', type, '\n')

  if (!packs[type][file])
    return console.log('\n', '⚠ No file', file, 'indexed at', type, '\n')

  const path = join(root, packs.dir, type, file)

  unlinkSync(path)

  delete packs[type][file]

  const count = Object.keys(packs[type]).length

  if (!count) delete packs[type]

  rewrite(packs)

  return console.log(
    '\n',
    '⚠ File',
    file,
    'deleted and removed from',
    type,
    '\n',
  )
}

// Helpers ---------------------------------------------------------------------
function valid(args = [], size = 1) {
  const count = args.length
  return (
    (count && count === size) || console.log('⚠ Invalid number of arguments')
  )
}

function packup(type = '', dest = '', source = '') {
  packs.dir = packs.dir || 'jsweb-packs'
  packs[type] = packs[type] || {}
  packs[type][dest] = source

  const index = collection()
  const result = index.reduce((lib, key) => {
    const sort = Object.keys(packs[key]).sort()

    lib[key] = sort.reduce((list, item) => {
      list[item] = packs[key][item]
      return list
    }, {})

    return lib
  }, {})

  return { dir: packs.dir, ...result }
}

async function download(dir = '', type = '', dest = '', source = '') {
  const lib = join(root, dir, type)
  const url = geturl(type, source)
  const file = join(lib, dest)
  const path = file.split('/')
  const check = path.slice(0, path.length - 1).join('/')

  console.log('\n', 'Downloading from', url, '...', '\n')

  await mkdirp(check)

  const get = await fetch(url)
  const buffer = await get.buffer()

  writeFileSync(file, buffer)
}

function geturl(type = '', source = '') {
  let url = types[type] ? `${types[type]}/${source}` : source

  const raw = /^gis?t/.test(type)

  if (raw) url += '/raw'

  return url
}

function downlog(dir = '', type = '', dest = '') {
  console.log('\n', 'File saved:', './', dir, '/', type, '/', dest, '\n')
}

function rewrite(data = {}) {
  pkgjson['@jsweb/packs'] = data

  const path = join(root, 'package.json')
  const json = JSON.stringify(pkgjson, null, 2)

  writeFileSync(path, json)
}

function collection() {
  return Object.keys(packs)
    .filter((k) => k !== 'dir')
    .sort()
}
