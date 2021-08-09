#!/usr/bin/env ts-node

import yargs from 'yargs';
import { ControllerHandlerState, HandlerChain, IncrementalIntermediary, InquirerPresenter, SystemHandlerParams } from '@cards-ts/core';
import { GameHandlerParams } from './game-handler-params';
import { ResponseMessage } from './messages/response-message';
import { GameSetup } from './game-setup';
import { GameFactory } from './game-factory';
import { Controllers } from './controllers/controllers';

yargs.command([ 'start', '$0' ], 'begin a new game', yargs => {
    yargs.option('players', {
        alias: 'p',
        type: 'number',
        description: 'Number of opponents to play against',
        default: 1,
    }).option('name', {
        alias: 'n',
        type: 'string',
        description: 'Player\'s name',
    })
        .options(new GameSetup().getYargs());
}, async argv => {
    const mainPlayerIntermediary = new IncrementalIntermediary(new InquirerPresenter());
    const names: string[] = [];
    let name: string = argv.name as string;
    if(!argv.name) {        
        // await mainPlayer.askForName();
        name = 'Jerome';
    }
    names.push(name);
    names.push('Greg');

    const gameFactory = new GameFactory();

    type HandlerData = ControllerHandlerState<Controllers>;

    const players: HandlerChain<SystemHandlerParams & GameHandlerParams, HandlerData, ResponseMessage>[] = Array(argv.players as number + 1);
    players[0] = gameFactory.getIntermediaryHandlerChain(mainPlayerIntermediary);
    for(let i = 1; i < players.length; i++) {
        players[i] = gameFactory.getDefaultBotHandlerChain();
    }

    const gameSetup = gameFactory.getGameSetup();

    const params = gameSetup.setupForYargs(argv);

    const errors = gameSetup.verifyParams(params);

    if(Object.keys(errors).length) {
        for(const error of Object.entries(errors)) {
            console.log(error[1]);
        }
        process.exitCode = 1;
    } else {
        await gameFactory.getGameDriver(players, params, names).start();
    }
})
    .help()
    .argv;
