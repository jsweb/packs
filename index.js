#!/usr/bin/env node

'use strict';

const fs = require('fs'),
    http = require('http'),
    https = require('https'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    cfg = path.join(process.cwd(), 'package.json')

let proj = require(cfg),
    snpks = proj.snipacks || {},
    argv = process.argv.slice(1).filter(i => !/snipacks/.test(i)),
    cmd = argv[0] || 'update',
    args = argv.slice(1),
    snipacks = {
        dir: snpks.dir || 'snipacks',
        update() {
            const all = () => this.getall(),
                dir = () => this.mkdir(all)
            return this.packup(dir)
        },
        mkdir(done) {
            fs.stat(this.dir, e => {
                return e ? mkdirp(this.dir, () => done()) : done()
            })
        },
        getall() {
            console.log('Async fetching snippets/packages...')
            Object.keys(snpks).filter(k => k !== 'dir').forEach(k => this[k](snpks[k]))
        },
        getfile(url, sub, out) {
            const web = /^https/i.test(url) ? https : http,
                dir = path.join(this.dir, sub),
                file = path.join(dir, out),
                request = () => web.get(url, resp => {
                    resp.pipe(fs.createWriteStream(file))
                    console.log(this.dir, '/', sub, '/', out, 'saved!');
                })
            fs.stat(dir, e => e ? fs.mkdir(dir, request) : request())
        },
        unpkg(packs) {
            const unpkg = 'https://unpkg.com',
                npm = 'https://registry.npmjs.org'

            Object.keys(packs).forEach(file => {
                const semver = packs[file].includes('@'),
                    src = packs[file].split(semver ? '@' : '/'),
                    pack = `${unpkg}/${src[0]}`,
                    getfile = req => this.getfile(`${pack}@${req}`, 'unpkg', file)

                return semver ? getfile(src[1]) : https.get(`${npm}/${src[0]}`, resp => {
                    let str = ''
                    resp.on('data', data => str += data)
                    resp.on('end', () => {
                        const json = JSON.parse(str),
                            vrs = json['dist-tags'].latest,
                            rest = (semver ? src[1].split('/') : src).slice(1).join('/'),
                            req = rest ? `${vrs}/${rest}` : vrs
                        return getfile(req)
                    })
                })
            })
        },
        snippets(type, codes) {
            const base = {
                gist: 'https://gist.githubusercontent.com',
                gitlab: 'https://gitlab.com/snippets'
            }
            Object.keys(codes).forEach(file => {
                this.getfile(`${base[type]}/${codes[file]}/raw`, type, file)
            })
        },
        gist(codes) {
            this.snippets('gist', codes)
        },
        gitlab(codes) {
            this.snippets('gitlab', codes)
        },
        web(assets) {
            Object.keys(assets).forEach(file => this.getfile(assets[file], 'web', file))
        },
        packup(done) {
            const result = Object.keys(proj.snipacks).filter(k => k !== 'dir').sort().reduce((o, i) => {
                o[i] = Object.keys(proj.snipacks[i]).sort().reduce((r, s) => {
                    r[s] = proj.snipacks[i][s]
                    return r
                }, {})
                return o
            }, {})
            proj.snipacks = Object.assign({ dir: this.dir }, result)
            fs.writeFile(cfg, JSON.stringify(proj, null, '\t'), done)
        },
        add(type, file, source) {
            let dep = {}
            dep[file] = source

            snpks[type] = Object.assign(snpks[type] || {}, dep)
            proj.snipacks = Object.assign(snpks, proj.snipacks)

            this.mkdir(() => {
                this.packup(() => this[type](dep))
            })
        },
        del(type, file) {
            const check = path.join(this.dir, type, file),
                resp = () => console.log(this.dir, '/', type, '/', file, 'deleted!'),
                delkey = () => {
                    delete proj.snipacks[type][file]
                    this.packup(resp)
                },
                delfile = done => fs.unlink(check, done)
            fs.stat(check, e => e ? delkey() : delfile(delkey))
        },
        list() {
            console.log(JSON.stringify(proj.snipacks, null, '    '))
        }
    }

return snipacks[cmd]
    ? snipacks[cmd].apply(snipacks, args)
    : console.log(cmd, 'is not a valid command!')
