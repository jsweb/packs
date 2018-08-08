# @jsweb/packs

A simple, fast and objective manager for packages, snippets and assets.

* CLI
* Packages/Snippets/Assets manager
* Simple, fast, objective
* Get only files you want from NPM packages
* Fetch Gist and Gitlab snippets to save as code
* Grab anything from the web
* All automated with a simple JSON setup

## Install

In your project:

```
npm i -S @jsweb/packs
```

Or...

```
yarn add @jsweb/packs
```

Then, include a new command in `package.json` into `scripts` section:

```json
{
  "scripts": {
    "packs": "@jsweb/packs"
  }
}
```

Choose a name of your preference, but point it to `@jsweb/packs`.

If you prefer, install it globaly:

```
npm i -g @jsweb/packs
```

Or, use with NPX:

```
npx @jsweb/packs
```

Then you can run CLI `@jsweb/packs` anywhere.

## Usage

**@jsweb/packs** reads a section at your `package.json` file that registers packages, snippets, gists or anything you want to fetch from web into your project.

Create a `@jsweb/packs` section like this:

```json
{
  "@jsweb/packs": {
    "dir": "jsweb-packs",
    "bundle": {
      "vue.lib.js": [
        "https://unpkg.com/vue/dist/vue.min.js",
        "https://unpkg.com/vuex/dist/vuex.min.js",
        "https://unpkg.com/vue-router/dist/vue-router.min.js"
      ]
    },
    "gist": {
      "asq.js": "jyamashiro24/17ac171a73246744b09a47d6c9d77241",
      "kav.js": "steven89/f7aedca683deee6ee8211399e94cd583"
    },
    "gitlab": {
      "dom.js": "34295",
      "dstrbg.styl": "1662645",
      "tplrender.js": "1663326"
    },
    "unpkg": {
      "moment.js": "moment/min/moment-with-locales.min.js",
      "truetype.js": "@jsweb/truetype",
      "normalize.css": "normalize.css"
    },
    "web": {
      "animate.css": "https://raw.githubusercontent.com/daneden/animate.css/master/animate.min.css",
      "js-logo.svg": "https://upload.wikimedia.org/wikipedia/commons/9/99/Unofficial_JavaScript_logo_2.svg"
    }
  }
}
```

Then, just run `snipacks` CLI command!

**Key : value** pairs within sections represent **destination : source**, so key is the filename where the asset will be saved and value is the source to fetch its content.

## Result

**@jsweb/packs** saves downloaded files into a diretory structure corresponding to `@jsweb/packs` section at `package.json`:

```
./
| -${@jsweb/packs dir}
  | - bundle
  | - gist
  | - gitlab
  | - unpkg
  | - web
```

## @jsweb/packs directory (since 1.2.0)

**@jsweb/packs** default dir is a `jsweb-packs` folder at `package.json` root, but it is possible to set a custom path to save your packs.

Just define `dir` on setup at `package.json`:

```json
{
    "@jsweb/packs": {
        "dir": "path/to/your/custom/packs"
    }
}
```

## How it works

### NPM / Unpkg

**@jsweb/packs** gets the code of NPM packages from Unpkg CDN. So, NPM packages must to be at `unpkg` section.

Optionally, you can use SEMVER tags if you need to specify packages versions, like:

```json
{
  "@jsweb/packs": {
    "unpkg": {
      "moment.js": "moment@2.22.2/min/moment-with-locales.min.js"
    }
  }
}
```

If no version was defined, latest version is default at Unpkg CDN.

### Gist and Gitlab Snippets

For these codes/snippets repositories, **@jsweb/packs** simply fetch raw files as is.

The codes must to be public available.

Gist needs `user/hash` to identify and get the code. Gitlab Snippets just need an `id`.

### Web / Anything

**@jsweb/packs** can fetch any public file online. Just map it into `web` section, like this:

```json
{
  "@jsweb/packs": {
    "web": {
      "js-logo.svg": "https://upload.wikimedia.org/wikipedia/commons/9/99/Unofficial_JavaScript_logo_2.svg",
      "npm-do-more.svg": "https://static.npmjs.com/images/saas-features/do-more-faster.svg"
    }
  }
}
```

### Bundle (since 1.3.0)

If you want to build a bundle of `.js` or `.css` files, it is easy with **@jsweb/packs**.

Map an Array with URLs to save your assets to a file into `bundle` section.

All fetched content will be concatenated in the same order and saved to the file.

```json
{
  "@jsweb/packs": {
    "bundle": {
      "lib.js": [
        "https://unpkg.com/core-js/client/core.min.js",
        "https://unpkg.com/vue/dist/vue.min.js",
        "https://unpkg.com/vuex/dist/vuex.min.js",
        "https://unpkg.com/vue-router/dist/vue-router.min.js"
      ]
    }
  }
}
```

## CLI commands

**@jsweb/packs** CLI support some simple commands. If none is given, `update` is default.

### update (default)

Update/fetch all of your assets with this simple command: `@jsweb/packs update` or simply `@jsweb/packs`.

**Important:** By default, this command rewrites `@jsweb/packs` section at `package.json` file to sort content. If you need to prevent this behavior for continous integration or any other production workflow, make sure to set `NODE_ENV` with any value that not contains `dev` (case not sensitive).

### add

You can add new assets to your project by manually adding `@jsweb/packs` section at `package.json` and runing `update` command.

But `@jsweb/packs add [type] [dest] [source]` command is a convenient way:

```
@jsweb/packs add unpkg moment.js moment/min/moment-with-locales.min.js

@jsweb/packs add gist kav.js steven89/f7aedca683deee6ee8211399e94cd583

@jsweb/packs add gitlab dom.js 34295

@jsweb/packs add web animate.css https://raw.githubusercontent.com/daneden/animate.css/master/animate.min.css
```

Arguments must follow this pattern:

* **type** represents the Internet end point where asset is hosted, section within `@jsweb/packs` at `package.json` and folder into @jsweb/packs directory
* **dest** defines the destination filename where to save content
* **source** is an ID, PATH or URL to fetch content

**Important:** This command ever writes data to `package.json` file to update `@jsweb/packs` section.

### del

To remove assets you can just delete files from directory and remove entry from `@jsweb/packs` section at `package.json`.

But you can simply run `@jsweb/packs del [type] [file]`:

```
@jsweb/packs del web jquery.js
```

**Important:** This command ever writes data to `package.json` file to update `@jsweb/packs` section.

## list

Prints `@jsweb/packs` section from `package.json`. Just for convenience!

```
@jsweb/packs list
```
