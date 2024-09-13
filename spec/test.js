#!/usr/bin/env node

// TODO change extension back to typescript when https://githusb.com/TypeStrong/ts-node/issues/2026 is resolved

import { IncrementalIntermediary, InquirerPresenter } from '@cards-ts/core';

if (!performance) {
    // eslint-disable-next-line no-var, @typescript-eslint/no-var-requires
    var { performance } = await import('perf_hooks');
}

async function run(libraryName) {
    try {
        const start = performance.now();

        const library = import('@cards-ts/' + libraryName);
        const { gameFactory, IntermediaryHandler } = await library;

        const postImport = performance.now();
        console.log(libraryName + ': import took ' + (postImport - start) + ' ms');

        const _humanPlayer = new IntermediaryHandler(new IncrementalIntermediary(new InquirerPresenter()));

        const numPlayers = libraryName === 'war' ? 2 : 4;

        const names = ['Jerome', 'Leah', 'Greg', 'Bart'].slice(0, numPlayers);

        const handlers = Array(numPlayers);
        for (let i = 0; i < handlers.length; i++) {
            handlers[i] = gameFactory.getDefaultBotHandlerChain();
        }

        const gameDriver = gameFactory.getGameDriver(handlers, gameFactory.getGameSetup().getDefaultParams(), names);

        const postSetup = performance.now();
        console.log(libraryName + ': setup took ' + (postSetup - postImport) + ' ms');

        await gameDriver.start();
        // TODO fix the problem of stalled game never returning here

        const end = performance.now();
        console.log(libraryName + ': running took ' + (end - postSetup) + ' ms');

        if (!gameDriver.gameState.controllers.completed.get()) {
            throw new Error('Game did not set completed flag');
        }

        return libraryName;
    } catch (e) {
        throw [libraryName, e];
    }
}

run(process.argv[2])
    .then(libraryName => {
        console.log(libraryName + ': completed');
    })
    .catch(([libraryName, e]) => {
        console.log(libraryName + ': threw');
        console.log(e);

        console.log(libraryName + ': errored');
    });
