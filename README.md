<h1 align="center">Cards-TS</h1>
<div align="center">

[![Github CI](https://img.shields.io/github/actions/workflow/status/johnameyer/cards-ts/ci.yml?logo=github)](https://github.com/johnameyer/cards-ts/actions)
[![npm version](https://img.shields.io/npm/v/@cards-ts/core?logo=npm)](https://www.npmjs.com/package/@cards-ts/core)
[![GitHub Last Commit](https://img.shields.io/github/last-commit/johnameyer/cards-ts?logo=github)](https://github.com/johnameyer/cards-ts)
[![Typescript](https://img.shields.io/github/languages/top/johnameyer/cards-ts?logo=typescript)]()
[![Documentation](https://img.shields.io/static/v1?label=docs&message=hosted&color=informational&logo=typescript)](https://johnameyer.github.io/cards-ts)
</div>

This is a card game framework and various card game implementations. The [core package](https://github.com/johnameyer/cards-ts/tree/master/src/core) contains the framework and useful components, including functionality to display a card game in the command line. The various other packages are card game implementations.

Can I Have That is a house variation on [Continental Rummy](https://en.wikipedia.org/wiki/Continental_Rummy).
[Hearts](https://en.wikipedia.org/wiki/Hearts_(card_game)) and [Euchre](https://en.wikipedia.org/wiki/Euchre) are trick-taking games.
Other implementations of card games or expansions of the core library are welcome.

## Running a card game with npx

```bash
npx @cards-ts/hearts # or can-i-have-that, etc.
```

## Implementing a new card game

See the [wiki page](./wiki/implementing-new-games.md).

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/johnameyer/cards-ts/tags).

## Authors

* **John Meyer** - *Initial work* - [johnameyer](https://github.com/johnameyer)

See also the list of [contributors](https://github.com/johnameyer/cards-ts/contributors) who participated in this project.
