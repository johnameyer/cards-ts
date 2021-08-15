<h1 align="center">Cards-TS</h1>
<div align="center">

[![Github CI](https://img.shields.io/github/workflow/status/johnameyer/cards-ts/ci?logo=github)](https://github.com/johnameyer/cards-ts/actions)
[![npm version](https://img.shields.io/npm/v/@cards-ts/core?logo=npm)](https://www.npmjs.com/package/@cards-ts/core)
[![GitHub Last Commit](https://img.shields.io/github/last-commit/johnameyer/cards-ts?logo=github)](https://github.com/johnameyer/cards-ts)
[![Typescript](https://img.shields.io/github/languages/top/johnameyer/cards-ts?logo=typescript)]()
[![Dependencies](https://img.shields.io/david/johnameyer/cards-ts?logo=npm)]()
[![Documentation](https://img.shields.io/static/v1?label=docs&message=hosted&color=informational&logo=typescript)](https://johnameyer.github.io/cards-ts)
</div>

This is a card game framework and various card game implementations. The [core package](https://github.com/johnameyer/cards-ts/tree/master/packages/core) contains the framework and useful components, including functionality to display a card game in the command line. The various other packages are card game implementations.

Can I Have That is a house variation on [Continental Rummy](https://en.wikipedia.org/wiki/Continental_Rummy).
[Hearts](https://en.wikipedia.org/wiki/Hearts_(card_game)) and [Euchre](https://en.wikipedia.org/wiki/Euchre) are trick-taking games.
Other implementations of card games or expansions of the core library are welcome.

## Getting Started

We use lerna and yarn workspaces to support a number of games on top of the core library. See the documentation pages [here](https://johnameyer.github.io/cards-ts) or see the wiki articles [here](tree/master/wiki).

### Running a card game with npx

```bash
npx @cards-ts/hearts # or can-i-have-that, etc.
```

### Running a card game locally

#### Building

```bash
yarn # typically only needed the first time
lerna run build # use "--include-dependencies --scope=@cards-ts/$GAME" to just build the game dependencies
```

#### Running

```bash
GAME=can-i-have-that # or hearts, etc.
lerna exec yarn run start --scope=@cards-ts/$GAME
```

or

```bash
GAME=can-i-have-that # or hearts, etc.
cd packages/$GAME
yarn start
```

## Testing

The tests in [spec folder](https://github.com/johnameyer/cards-ts/tree/spec) test that each game exports a minimum number of fields and that the bots will be able to complete the game successfully (Run with `yarn start` in the folder locally). Each package can also contain a spec folder as well for unit testing components with mocha (Run all with `lerna run test` or in a package with `npm run test`).

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/johnameyer/cards-ts/tags).

## Authors

* **John Meyer** - *Initial work* - [johnameyer](https://github.com/johnameyer)

See also the list of [contributors](https://github.com/johnameyer/cards-ts/contributors) who participated in this project.