<h1 align="center">Cards-TS</h1>
<div align="center">

[![Github CI](https://img.shields.io/github/actions/workflow/status/johnameyer/cards-ts/ci.yml?logo=github)](https://github.com/johnameyer/cards-ts/actions)
[![npm version](https://img.shields.io/npm/v/@cards-ts/core?logo=npm)](https://www.npmjs.com/package/@cards-ts/core)
[![GitHub Last Commit](https://img.shields.io/github/last-commit/johnameyer/cards-ts?logo=github)](https://github.com/johnameyer/cards-ts)
[![Typescript](https://img.shields.io/github/languages/top/johnameyer/cards-ts?logo=typescript)]()
[![Documentation](https://img.shields.io/static/v1?label=docs&message=hosted&color=informational&logo=typescript)](https://johnameyer.github.io/cards-ts)
</div>

This is a card game framework and various card game implementations. The [core package](https://github.com/johnameyer/cards-ts/tree/master/packages/core) contains the framework and useful components, including functionality to display a card game in the command line. The various other packages are card game implementations.

Can I Have That is a house variation on [Continental Rummy](https://en.wikipedia.org/wiki/Continental_Rummy).
[Hearts](https://en.wikipedia.org/wiki/Hearts_(card_game)) and [Euchre](https://en.wikipedia.org/wiki/Euchre) are trick-taking games.
Other implementations of card games or expansions of the core library are welcome.

## Getting Started

We use pnpm workspaces to support a number of games on top of the core library. See the documentation pages [here](https://johnameyer.github.io/cards-ts) or see the wiki articles [here](https://github.com/johnameyer/cards-ts/tree/master/wiki).

### Running a card game locally

#### Building

```bash
pnpm i # typically only needed the first time
pnpm -w buildall
```

or


```bash
pnpm i # typically only needed the first time
cd packages/hearts
pnpm -F {.}... build
```

All packages also expose the commands `lint`, `clean`, `madge`, and `test`.

#### Running

All game packages also expose a `start` command to build and run the game as well as a `ts-start` command to run the typescript directly.

```bash
pnpm -F hearts start
```

or

```bash
cd src/$GAME
pnpm start
```

## Testing

The tests in [spec folder](https://github.com/johnameyer/cards-ts/tree/spec) test that each game exports a minimum number of fields and that the bots will be able to complete the game successfully (Run with `pnpm start` in the folder locally). Each package can also contain a spec folder as well for unit testing components with mocha (Run all with `pnpm testall` or in a package with `pnpm test`).

