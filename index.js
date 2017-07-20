#!/usr/bin/env node

'use strict';

const fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    request = require('request'),
    cfg = path.join(process.cwd(), 'package.json')

function get(url) {
    return new Promise(done => {
        request.get(url, (e, res, body) => done(body))
    })
}

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
        unpkg(packs) {
            const unpkg = 'https://unpkg.com',
                npm = 'https://registry.npmjs.org'

            Object.keys(packs).forEach(file => {
                const semver = packs[file].includes('@'),
                    src = packs[file].split(semver ? '@' : '/'),
                    pack = `${unpkg}/${src[0]}`,
                    getfile = req => this.getfile(`${pack}@${req}`, 'unpkg', file)

                return semver ? getfile(src[1]) : get(`${npm}/${src[0]}`).then(resp => {
                    const json = JSON.parse(resp),
                        vrs = json['dist-tags'].latest,
                        rest = (semver ? src[1].split('/') : src).slice(1).join('/'),
                        req = rest ? `${vrs}/${rest}` : vrs
                    return getfile(req)
                })
            })
        },
        bundle(assets) {
            const sub = 'bundle',
                dir = path.join(this.dir, sub),
                fetch = () => Object.keys(assets).forEach(out => {
                    const file = path.join(dir, out)
                    Promise.all(assets[out].map(get)).then(codes => {
                        const code = codes.join('\n').replace(/\/\/#.+\.map\s/g, '')
                        fs.writeFile(file, code, () => {
                            console.log(this.dir, '/', sub, '/', out, 'saved!')
                        })
                    })
                })
            fs.stat(dir, e => e ? fs.mkdir(dir, fetch) : fetch())
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
            const dir = path.join(this.dir, sub),
                file = path.join(dir, out),
                fetch = () => get(url).then(resp => {
                    fs.writeFile(file, resp, () => {
                        console.log(this.dir, '/', sub, '/', out, 'saved!')
                    })
                })
            fs.stat(dir, e => e ? fs.mkdir(dir, fetch) : fetch())
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
        }
    }

return snipacks[cmd]
    ? snipacks[cmd].apply(snipacks, args)
    : console.log(cmd, 'is not a valid command!')
