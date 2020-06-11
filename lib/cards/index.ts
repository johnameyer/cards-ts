/* tslint:disable */

import { GameDriver } from './game-driver';
import { ConsoleHandler } from './handlers/console-handler';
import { LocalMaximumHandler } from './handlers/local-maximum-handler';
import { defaultParams } from './game-params';
import yargs from 'yargs';

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
    const mainPlayer = new ConsoleHandler();
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
