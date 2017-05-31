#!/usr/bin/env node
'use strict'

const fs = require('fs'),
	https = require('https'),
	path = require('path'),
	proc = require('process'),
	chroot = proc.cwd(),
	config = path.join(chroot, 'snipacks.json'),
	deps = require(config),
	snipacks = {
		dir: path.join(chroot, deps.dir),
		update() {
			fs.stat(this.dir, (e, s) => e && !s ? fs.mkdir(this.dir, () => this.loop()) : this.loop())
		},
		loop() {
			console.log('Async fetching snippets/packages...')
			Object.keys(deps).filter(k => k !== 'dir').forEach(k => this[k](deps[k]))
			console.log(`Your files will be saved at ${this.dir}`)
		},
		getfile(url, out) {
			return https.get(url, resp => {
				const file = path.join(this.dir, out)
				return resp.pipe(fs.createWriteStream(file))
			})
		},
		unpkg(deps) {
			const unpkg = 'https://unpkg.com',
				npm = 'https://registry.npmjs.org'
			deps.forEach(dep => {
				const version = dep.version,
					url = `${unpkg}/${dep.id}`,
					getfile = vs => this.getfile(`${url}@${vs}`, dep.file)

				return version ? getfile(version) : https.get(`${npm}/${dep.id}`, resp => {
					let str = ''
					resp.on('data', data => str += data)
					resp.on('end', () => {
						const json = JSON.parse(str),
							vrs = json['dist-tags'].latest
						return getfile(vrs)
					})
				})
			})
		},
		gist(deps) {
			const gist = 'https://gist.githubusercontent.com'
			deps.forEach(dep => this.getfile(`${gist}/${dep.id}/raw`, dep.file))
		},
		gitlabs(deps) {
			const gitlabs = 'https://gitlab.com/snippets'
			deps.forEach(dep => this.getfile(`${gitlabs}/${dep.id}/raw`, dep.file))
		}
	}

snipacks.update.call(snipacks)
