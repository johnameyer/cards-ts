#!/usr/bin/env node
// TODO this is provided for the sake of npx and being able to run the generated file

/* tslint:disable */

import yargs from "yargs";
import { IntermediaryHandler } from "./handlers/intermediary-handler";
import { HeuristicHandler } from "./handlers/heuristic-handler";
import { GameDriver } from "./game-driver";
import { defaultParams } from "./game-params";
import { GameState } from "./game-state";
import { IncrementalIntermediary, InquirerPresenter } from "@cards-ts/core";
import { StateTransformer } from "./state-transformer";

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

    const driver = new GameDriver(players, new StateTransformer().initialState({ numPlayers: players.length, gameParams: defaultParams }));

    await driver.start();
})
.help()
.argv
