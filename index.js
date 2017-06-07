#!/usr/bin/env node

'use strict'

let fs = require('fs'),
    http = require('http'),
    https = require('https'),
    path = require('path'),
    proc = require('process'),
    cfg = path.join(proc.cwd(), 'package.json'),
    proj = require(cfg),
    snpks = proj.snipacks || {},
    argv = proc.argv.slice(1).filter(i => !/snipacks/.test(i)),
    cmd = argv[0] || 'update',
    args = argv.slice(1),
    snipacks = {
        dir: 'snipacks',
        update() {
            this.mkdir(() => {
                console.log('Async fetching snippets/packages...')
                Object.keys(snpks).filter(k => k !== 'dir').forEach(k => this[k](snpks[k]))
            })
        },
        mkdir(done) {
            fs.stat(this.dir, e => {
                return e ? fs.mkdir(this.dir, () => done()) : done()
            })
        },
        getfile(url, sub, out) {
            const web = /^https/i.test(url) ? https : http,
                dir = path.join(this.dir, sub),
                file = path.join(dir, out),
                request = () => web.get(url, resp => {
                    resp.pipe(fs.createWriteStream(file))
                    console.log('snipacks', '/', sub, '/', out, 'saved!');
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
                resp = () => console.log('snipacks', '/', type, '/', file, 'deleted!'),
                delkey = () => {
                    delete proj.snipacks[type][file]
                    this.packup(resp)
                },
                delfile = done => fs.unlink(check, done)
            fs.stat(check, e => e ? delkey() : delfile(delkey))
        }
    }

return snipacks[cmd]
    ? snipacks[cmd].apply(snipacks, args)
    : console.log(cmd, 'is not a valid command!')
