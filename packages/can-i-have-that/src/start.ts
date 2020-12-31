#!/usr/bin/env ts-node

import { GameStateIterator } from './game-state-iterator';
import { LocalMaximumHandler } from './handlers/local-maximum-handler';
import { defaultParams } from './game-params';
import yargs from 'yargs';
import { IntermediaryHandler } from './handlers/intermediary-handler';
import { GameDriver, HandlerChain, IncrementalIntermediary, InquirerPresenter, IntermediarySystemHandler } from '@cards-ts/core';
import { StateTransformer } from './state-transformer';
import { ResponseValidator } from './response-validator';
import { SystemHandlerParams } from '@cards-ts/core/lib/handlers/system-handler';
import { GameHandlerParams } from './game-handler';
import { HandlerData } from './handler-data';
import { ResponseMessage } from './messages/response-message';

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
    const mainPlayerIntermediary = new IncrementalIntermediary(new InquirerPresenter());
    let names: string[] = [];
    let name: string = argv.name as string;
    if(!argv.name) {        
        // await mainPlayer.askForName();
        name = 'Jerome';
    }
    names.push(name);
    names.push('Greg', 'Hugh', 'Leah');

    const players: HandlerChain<SystemHandlerParams & GameHandlerParams, HandlerData, ResponseMessage>[] = Array(argv.players as number + 1).fill(undefined).map(_ => (new HandlerChain()));
    players[0].append(new IntermediarySystemHandler(mainPlayerIntermediary)).append(new IntermediaryHandler(mainPlayerIntermediary));
    for(let i = 1; i < players.length; i++) {
        players[i].append(new LocalMaximumHandler());
    }

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
