#!/usr/bin/env node

'use strict'

let fs = require('fs'),
    https = require('https'),
    path = require('path'),
    proc = require('process'),
    cwd = proc.cwd(),
    cfg = path.join(cwd, 'package.json'),
    deps = require(cfg).snipacks || {},
    snipacks = {
        dir: 'snipacks',
        update() {
            fs.stat(this.dir, e => {
                return e ? fs.mkdir(this.dir, () => this.loop()) : this.loop()
            })
        },
        loop() {
            console.log('Async fetching snippets/packages...')
            Object.keys(deps).filter(k => k !== 'dir').forEach(k => this[k](deps[k]))
            console.log(`Your files will be saved at ${this.dir}`)
        },
        getfile(url, sub, out) {
            const dir = path.join(this.dir, sub),
                file = path.join(dir, out),
                request = () => https.get(url, resp => resp.pipe(fs.createWriteStream(file)))
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
                },
                src = base[type]
            
            Object.keys(codes).forEach(file => {
                const id = codes[file]
                this.getfile(`${src}/${id}/raw`, type, file)
            })
        },
        gist(codes) {
            this.snippets('gist', codes)
        },
        gitlab(codes) {
            this.snippets('gitlab', codes)
        }
    }

snipacks.update.call(snipacks)
