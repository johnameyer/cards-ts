#!/usr/bin/env node
// this is provided for the sake of npx and being able to run the generated file

/* tslint:disable */

import { GameDriver } from './game-driver';
import { LocalMaximumHandler } from './handlers/local-maximum-handler';
import { defaultParams } from './game-params';
import yargs from 'yargs';
import { IntermediaryHandler } from './handlers/intermediary-handler';
import { IncrementalIntermediary, InquirerPresenter } from '@cards-ts/core';

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
    players[0] = mainPlayer;
    for(let i = 1; i < players.length; i++) {
        players[i] = new LocalMaximumHandler();
    }

    const driver = new GameDriver(players, defaultParams);

    await driver.start();
})
.help()
.argv
