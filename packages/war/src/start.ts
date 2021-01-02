#!/usr/bin/env ts-node

import yargs from "yargs";
import { IntermediaryHandler } from "./handlers/intermediary-handler";
import { DefaultBotHandler } from "./handlers/default-bot-handler";
import { GameStateIterator } from "./game-state-iterator";
import { defaultParams } from "./game-params";
import { GameDriver, HandlerChain, IncrementalIntermediary, InquirerPresenter, IntermediarySystemHandler, SystemHandlerParams } from "@cards-ts/core";
import { StateTransformer } from "./state-transformer";
import { GameHandler, GameHandlerParams } from "./game-handler";
import { ResponseValidator } from "./response-validator";
import { HandlerData } from "./handler-data";
import { ResponseMessage } from "./messages/response-message";

yargs.command(['start', '$0'], 'begin a new game', yargs => {
    yargs.option('players', {
        alias: 'p',
        type: 'number',
        description: 'Number of opponents to play against',
        default: 1
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
    names.push('Greg');

    const players: HandlerChain<SystemHandlerParams & GameHandlerParams, HandlerData, ResponseMessage>[] = Array(argv.players as number + 1).fill(undefined).map(_ => (new HandlerChain()));
    players[0].append(new IntermediarySystemHandler(mainPlayerIntermediary)).append(new IntermediaryHandler(mainPlayerIntermediary));
    for(let i = 1; i < players.length; i++) {
        players[i].append(new DefaultBotHandler());
    }

    const stateTransformer = new StateTransformer();
    const responseValidator = new ResponseValidator();
    const gameStateIterator = new GameStateIterator();

    const driver = new GameDriver(players, stateTransformer.initialState({ names: names, gameParams: defaultParams }), gameStateIterator, stateTransformer, responseValidator);

    await driver.start();
})
.help()
.argv
