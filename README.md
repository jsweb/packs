# Snipacks

A dead simple, fast and objective CLI package manager for anything without dependencies

- CLI
- Package/Snippets/Assets manager
- Dead simple, fast, objective
- Get only files you want from NPM packages
- Get Gist and Gitlab snippets to save as code
- All automated by a simple JSON config file

## Install

In your project:

```
npm i -S snipacks
```

Then, include a new command in `package.json` into `scripts` section:

```json
{
	"scripts": {
		"snipacks": "snipacks"
	}
}
```

Choose a name of your preference, but point it to `snipacks` command.

Or, if you prefer, install it globaly:

```
npm i -g snipacks
```

Then you can run CLI `snipacks` command at root directory of any project.

## Usage

**Snipacks** reads a section at your `package.json` file that register packages, snippets, gists or anything you want to fetch into your project.

Create a `snipacks` section like this:

```json
{
	"snipacks": {
		"unpkg": {
            "worktopus.js": "worktopus",
            "moment.js": "moment/min/moment-with-locales.min.js"
        },
		"gist": {
            "kav.js": "steven89/f7aedca683deee6ee8211399e94cd583",
            "asq.js": "jyamashiro24/17ac171a73246744b09a47d6c9d77241"
        },
        "gitlab": {
            "dom.js": "34295",
            "dstrbg.styl": "1662645",
            "tplrender.js": "1663326"
        },
        "web": {
            "jquery.js": "https://code.jquery.com/jquery-3.2.1.slim.min.js",
            "animate.css": "https://raw.githubusercontent.com/daneden/animate.css/master/animate.min.css"
        }
	}
}
```

Then, just run `snipacks` CLI command!

Key-value pairs within sections represent file-source, so key is the filename where asset will be saved and value is the source to fetch.

## Result

**Snipacks** saves downloaded files into a diretory structure corresponding to `snipacks` section at `package.json`:

```
./
snipacks
| - gist
| - gitlab
| - unpkg
```

## How it works

### NPM / Unpkg

**Snipacks** check NPM packages versions on NPM registry but get the code from Unpkg CDN. So, NPM packages must to be at `unpkg` section.

Optionally, you can use SEMVER tags if you need to specific packages versions, like:

```json
{
	"snipacks": {
		"unpkg": {
            "moment.js": "moment@2.18.1/min/moment-with-locales.min.js"
        }
	}
}
```

If no version was defined, latest version is default.

### Gist and Gitlab Snippets

For these codes/snippets repositories, **Snipacks** simply fetch the raw files as is.

The codes must to be public available.

Gist needs `user/hash` to identify and get the code. Gitlab Snippets just need an `id`.

### Web / Anything

**Snipacks** can fetch any public file online. Just map it into `web` section.

## CLI commands

**Snipacks** CLI support some simple commands. If none was given, `update` is default.

### update

Update/fetch all of your assets with this simple command: `snipacks update` or simply `snipacks`.

### add

You can add new assets to your project by manually adding `snipacks` section at `package.json` and runing `update` command.

But `snipacks add [type] [file] [source]` command is a better way:

```
snipacks add unpkg moment.js moment/min/moment-with-locales.min.js

snipacks add gist kav.js steven89/f7aedca683deee6ee8211399e94cd583

snipacks add gitlab dom.js 34295

snipacks add web animate.css https://raw.githubusercontent.com/daneden/animate.css/master/animate.min.css
```

Arguments must follow this pattern:

- **type** represents the Internet end point where asset is hosted, section within `snipacks` at `package.json` and folder into snipacks directory
- **file** define the filename where to save content
- **source** is an ID, PATH or URL to fetch content

### del

To remove assets you can just delete files from directory and remove entry from `snipacks` section at `package.json`.

But you can simply run `snipacks del [type] [file]`:

```
snipacks del web jquery.js
```
