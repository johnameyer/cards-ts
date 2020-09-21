#!/usr/bin/env node
// this is provided for the sake of npx and being able to run the generated file

/* tslint:disable */

import yargs from "yargs";
import { IntermediaryHandler } from "./handlers/intermediary-handler";
import { HeuristicHandler } from "./handlers/heuristic-handler";
import { GameDriver } from "./game-driver";
import { defaultParams } from "./game-params";
import { GameState } from "./game-state";
import { Hand } from "./hand";
import { IncrementalIntermediary, InquirerPresenter } from "@cards-ts/core";

yargs.command(['start', '$0'], 'begin a new game', yargs => {
    yargs.option('players', {
        alias: 'p',
        type: 'number',
        description: 'Number of opponents to play against',
        default: 3
    }).option('name', {
        alias: 'n',
        type: 'string',
        description: 'Player\'s name'
    });
}, async argv => {
    const mainPlayer = new IntermediaryHandler(new IncrementalIntermediary(new InquirerPresenter()));
    if(!argv.name) {        
        await mainPlayer.askForName();
    } else {
        mainPlayer.setName(argv.name as string);
    }

    const players = Array(argv.players as number + 1);
    players[0] = new Hand(mainPlayer, 0);
    for(let i = 1; i < players.length; i++) {
        players[i] = new Hand(new HeuristicHandler(), i);
    }

    const driver = new GameDriver(players, new GameState(players.length, defaultParams, GameState.State.START_GAME));

    await driver.start();
})
.help()
.argv
