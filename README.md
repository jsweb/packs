# @jsweb/packs

A simple, fast and objective manager for modules, snippets, assets or anything with no dependencies.

**Note:** Since version 3.0.0, @jsweb/packs requires Node.js v16.0.0 or higher and should break compatibility with older Node.js versions.

- CLI
- Modules/Snippets/Assets manager
- Simple, fast, objective
- Get only files you want from NPM packages
- Fetch Gist and Gitlab snippets to save as code
- Grab anything from the web
- All automated with a simple JSON setup

---

- [@jsweb/packs](#jswebpacks)
  - [Install](#install)
  - [Usage](#usage)
  - [Result](#result)
  - [@jsweb/packs directory](#jswebpacks-directory)
  - [CLI commands](#cli-commands)
    - [update (default)](#update-default)
    - [add](#add)
    - [del](#del)
    - [list](#list)
  - [How it works](#how-it-works)
    - [NPM / Unpkg](#npm--unpkg)
    - [Gist and Gitlab Snippets](#gist-and-gitlab-snippets)
    - [Web / Anything](#web--anything)

---

## Install

In your project:

```
npm i -D @jsweb/packs
```

Or...

```
yarn add @jsweb/packs
```

Then, include a new command in `package.json` into `scripts` section:

```json
{
  "scripts": {
    "packs": "packs"
  }
}
```

Choose a name of your preference, but point it to `packs`, or just use with NPX or Yarn into your project folder: `npx packs` or `yarn packs`.

If you prefer, install it globaly: `npm i -g @jsweb/packs` or `yarn global add @jsweb/packs`.

Then you can run `packs` CLI anywhere.

Or, use with NPX without install: `npx -p @jsweb/packs packs`.

## Usage

**@jsweb/packs** reads a section at your `package.json` file to register packages, snippets, gists or anything you want to fetch from web into your project.

Just create a `@jsweb/packs` section like this:

```json
{
  "@jsweb/packs": {
    "dir": "jsweb-packs",
    "gist": {
      "asq.js": "jyamashiro24/17ac171a73246744b09a47d6c9d77241",
      "steven89/kav.js": "steven89/f7aedca683deee6ee8211399e94cd583"
    },
    "gitlab": {
      "dom.js": "34295",
      "dstrbg.styl": "1662645",
      "tpl/render.js": "1663326"
    },
    "unpkg": {
      "moment.js": "moment/min/moment-with-locales.min.js",
      "jsweb/truetype.js": "@jsweb/truetype",
      "normalize.css": "normalize.css"
    },
    "web": {
      "animate.css": "https://raw.githubusercontent.com/daneden/animate.css/master/animate.min.css",
      "img/js.svg": "https://upload.wikimedia.org/wikipedia/commons/9/99/Unofficial_JavaScript_logo_2.svg"
    }
  }
}
```

Then, just run `packs update` CLI command!

**key : value** pairs within sections represent **destination : source**, so **key** is the filename where the asset will be saved and **value** is the source to fetch its content.

You can save your assets in sub directories by setting **key** as a path to save into respective section.

## Result

**@jsweb/packs** saves downloaded files into a diretory structure corresponding to `@jsweb/packs` section at `package.json`:

```
./
| -${packs dir}
  | - gist
  | - gitlab
  | - unpkg
  | - web
```

## @jsweb/packs directory

**@jsweb/packs** default dir is a `jsweb-packs` folder at `package.json` root directory, but it is possible to set a custom path to save your assets.

Just define `dir` on setup at `package.json`:

```json
{
  "@jsweb/packs": {
    "dir": "path/to/your/custom/packs"
  }
}
```

## CLI commands

**@jsweb/packs** CLI support some simple commands. If none is given, `help` is default.

### update

Update/fetch all of your assets with this simple command: `packs update`.

**Important:** By default, this command rewrites `@jsweb/packs` section at `package.json` file to properly sort the content. If you need to prevent this behavior for CI/CD or any other production workflow, make sure to set `NODE_ENV` to any value which not contains `dev` (case not sensitive).

### add

You can add new assets to your project by manually adding `@jsweb/packs` section at `package.json` and runing `update` command.

But `packs add [type] [dest] [source]` command is a convenient way:

```bash
packs add unpkg moment.js moment/min/moment-with-locales.min.js

packs add gist steven89/kav.js steven89/f7aedca683deee6ee8211399e94cd583

packs add gitlab dom.js 34295

packs add web animate.css https://raw.githubusercontent.com/daneden/animate.css/master/animate.min.css
```

Arguments must follow this pattern:

- **type** the resource type where the asset is hosted, section within `@jsweb/packs` at `package.json` and folder into `@jsweb/packs->dir`
- **dest** defines the destination path/filename where to save content
- **source** is an ID, PATH or URL to fetch content

**Important:** This command ever writes data to `package.json` file to update `@jsweb/packs` section.

### del

To remove assets you can just delete files from directory and remove entry from `@jsweb/packs` section at `package.json`.

But you can simply run `packs del [type] [file]`:

```
packs del web jquery.js
```

**Important:** This command ever writes data to `package.json` file to update `@jsweb/packs` section.

### list

Prints `@jsweb/packs` section from `package.json`. Just for convenience!

```
packs list
```

## How it works

### NPM / Unpkg

**@jsweb/packs** gets the code of NPM packages from Unpkg CDN.

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

If no version was defined, the latest version is the default at Unpkg CDN.

### Gist and Gitlab Snippets

For code snippets repositories, **@jsweb/packs** simply fetch raw files as is.

The codes must to be public available.

Gists need `user/hash` to identify and get the code. Gitlab Snippets just need an `id`.

### Web / Anything

**@jsweb/packs** can fetch any online public file. Just map it into `web` section, like this:

```json
{
  "@jsweb/packs": {
    "web": {
      "img/js.svg": "https://upload.wikimedia.org/wikipedia/commons/9/99/Unofficial_JavaScript_logo_2.svg",
      "img/npm-do-more.svg": "https://static.npmjs.com/images/saas-features/do-more-faster.svg"
    }
  }
}
```
