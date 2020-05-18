import { GameDriver } from './game-driver';
import { ConsoleHandler } from './handlers/console-handler';
import { LocalMaximumHandler } from './handlers/local-maximum-handler';
import { defaultParams } from './game-params';

/**
 * Start a game for the console user
 * @param argv the arguments to run using
 */
async function run(argv: string[]) {
    const mainPlayer = new ConsoleHandler();
    await mainPlayer.askForName();

    const players = [mainPlayer, new LocalMaximumHandler(), new LocalMaximumHandler(), new LocalMaximumHandler()];

    const driver = new GameDriver(players, defaultParams);

    driver.start();
}

run(process.argv);
