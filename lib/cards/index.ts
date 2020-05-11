import { GameDriver } from './game-driver';
import { ConsoleHandler } from './handlers/console-handler';
import { GrammyHandler } from './handlers/grammy-handler';
import { LocalMaximumHandler } from './handlers/local-maximum-handler';
import { defaultParams } from './game-params';

async function run(argv: string[]) {
    const mainPlayer = new ConsoleHandler();
    await mainPlayer.askForName();

    const players = [mainPlayer, new LocalMaximumHandler(), new LocalMaximumHandler(), new LocalMaximumHandler()];

    const driver = new GameDriver(players, defaultParams);

    driver.start();
}

run(process.argv);
