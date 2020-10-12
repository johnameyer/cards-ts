<h1 align="center">can-i-have-that</h1>
<div align="center">

![GitHub last commit](https://img.shields.io/github/last-commit/johnameyer/can-i-have-that)
</div>

This is a card game framework and implementation. The core package contains the framework and useful components, including functionality to display a card game in the command line. The various other packages are card game implementations.

Can I Have That is a house variation on [Continental Rummy](https://en.wikipedia.org/wiki/Continental_Rummy).
[Hearts](https://en.wikipedia.org/wiki/Hearts_(card_game)) is a trick-taking game.
Other implementations of card games or expansions of the core library are welcome.

## Getting Started

We use lerna to support a number of games on top of the core library.

### Running a card game with npx

```bash
GAME=can-i-have-that # or hearts, etc.
npx @cards-ts/$GAME
```

### Running a card game locally

```bash
GAME=can-i-have-that # or hearts, etc.
lerna bootstrap
lerna run build --include-dependencies --scope=@cards-ts/$GAME
lerna exec npm run start --scope=@cards-ts/$GAME
```

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/johnameyer/can-i-have-that/tags).

## Authors

* **John Meyer** - *Initial work* - [johnameyer](https://github.com/johnameyer)

See also the list of [contributors](https://github.com/johnameyer/can-i-have-that/contributors) who participated in this project.