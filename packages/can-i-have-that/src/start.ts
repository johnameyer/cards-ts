#!/usr/bin/env ts-node

import { GameStateIterator } from './game-state-iterator';
import { LocalMaximumHandler } from './handlers/local-maximum-handler';
import { defaultParams } from './game-params';
import yargs from 'yargs';
import { IntermediaryHandler } from './handlers/intermediary-handler';
import { GameDriver, IncrementalIntermediary, InquirerPresenter } from '@cards-ts/core';
import { StateTransformer } from './state-transformer';
import { ResponseValidator } from './response-validator';

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
    // if(!argv.name) {        
    //     await mainPlayer.askForName();
    // } else {
    //     mainPlayer.setName(argv.name as string);
    // }

    const players = Array(argv.players as number + 1);
    players[0] = mainPlayer;
    for(let i = 1; i < players.length; i++) {
        players[i] = new LocalMaximumHandler();
    }
    let names: string[] = [];
    let name: string = argv.name as string;
    if(!argv.name) {        
        // await mainPlayer.askForName();
        name = 'Jerome';
    }
    names.push(name);
    names.push('Greg', 'Hugh', 'Leah');

    const stateTransformer = new StateTransformer();
    const responseValidator = new ResponseValidator();
    const gameStateIterator = new GameStateIterator();

    const initialState = stateTransformer.initialState({
        names: names,
        gameParams: defaultParams
    });

    const driver = new GameDriver(players, initialState, gameStateIterator, stateTransformer, responseValidator);

    await driver.start();
})
.help()
.argv
