# Snipacks

A dead simple, fast and objective CLI package manager for anything without dependencies

- CLI
- Package/Snippets/Assets manager
- Dead simple, fast, objective
- Get only main files from NPM packages
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

Or, if you prefer, you can install it globaly:

```
npm i -g snipacks
```

Then you can run CLI command at root directory of any project.

## Usage

**Snipacks** reads a section at your `package.json` file that register packages, snippets, gists or anything you want to fetch into your project.

Create a `snipacks` section like this:

```json
{
	"snipacks": {
		"unpkg": {
            "worktopus.js": "worktopus",
            "moment.js": "moment/min/moment-with-locales.min.js",
            "jquery.js": "jquery/dist/jquery.min.js"
        },
        "gitlab": {
            "dom.js": "34295",
            "dstrbg.styl": "1662645",
            "tplrender.js": "1663326"
        },
		"gist": {
            "kav.js": "steven89/f7aedca683deee6ee8211399e94cd583",
            "asq.js": "jyamashiro24/17ac171a73246744b09a47d6c9d77241"
        }
	}
}
```
