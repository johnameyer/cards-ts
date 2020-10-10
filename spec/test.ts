#!/usr/bin/env ts-node

if(!performance) {
    var { performance } = require('perf_hooks');
}

import { GameDriver, IncrementalIntermediary, InquirerPresenter } from '@cards-ts/core';

async function run(libraryName: string) {
    try {
        const start = performance.now();

        const library = import('@cards-ts/' + libraryName);
        const { defaultParams, GameStateIterator, IntermediaryHandler, ResponseValidator, StateTransformer, DefaultBotHandler } = await library;

        const postImport = performance.now();
        console.log(libraryName + ': import took ' + (postImport - start) + ' ms');

        const _humanPlayer = new IntermediaryHandler(new IncrementalIntermediary(new InquirerPresenter()));

        let names: string[] = ['Jerome', 'Leah', 'Greg', 'Bart'];

        const handlers = Array(4);
        for(let i = 0; i < handlers.length; i++) {
            handlers[i] = new DefaultBotHandler();
        }

        const stateTransformer = new StateTransformer();
        const responseValidator = new ResponseValidator();
        const gameStateIterator = new GameStateIterator();
        const initialState = stateTransformer.initialState({ names: names, gameParams: defaultParams });

        const gameDriver = new GameDriver(handlers, initialState, gameStateIterator, stateTransformer, responseValidator);
        
        const postSetup = performance.now();
        console.log(libraryName + ': setup took ' + (postSetup - postImport) + ' ms');

        await gameDriver.start();

        const end = performance.now();
        console.log(libraryName + ': running took ' + (end - postSetup) + ' ms');
        
        if(!gameDriver.gameState.completed) {
            throw new Error('Game did not set completed flag');
        }

        console.log(libraryName + ': completed');

        return;
    } catch(e) {
        console.log(libraryName + ': errored');
        console.log(e);
    }
}

run(process.argv[2]);