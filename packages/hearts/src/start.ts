#!/usr/bin/env ts-node

import yargs from "yargs";
import { IntermediaryHandler } from "./handlers/intermediary-handler";
import { HeuristicHandler } from "./handlers/heuristic-handler";
import { GameStateIterator } from "./game-state-iterator";
import { StateTransformer } from "./state-transformer";
import { GameHandlerParams } from "./game-handler";
import { ResponseValidator } from "./response-validator";
import { HandlerData } from "./handler-data";
import { IncrementalIntermediary, InquirerPresenter, HandlerChain, SystemHandlerParams, IntermediarySystemHandler, GameDriver } from "@cards-ts/core";
import { ResponseMessage } from "./messages/response-message";

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
        players[i].append(new HeuristicHandler());
    }

    const stateTransformer = new StateTransformer();
    const responseValidator = new ResponseValidator();
    const gameStateIterator = new GameStateIterator();

    const driver = new GameDriver(players, stateTransformer.initialState({ names: names, gameParams: new GameSetup().getDefaultParams() }), gameStateIterator, stateTransformer, responseValidator);

    await driver.start();
})
.help()
.argv
