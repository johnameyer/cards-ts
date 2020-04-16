import { main } from './main';
import { ConsoleHandler } from './handlers/console-handler';
import { GrammyHandler } from './handlers/grammy-handler';
import { LocalMaximumHandler } from './handlers/local-maximum-handler';

async function run(argv: string[]) {
    const mainPlayer = new ConsoleHandler();
    await mainPlayer.askForName();

    const players = [mainPlayer, new LocalMaximumHandler(), new LocalMaximumHandler(), new LocalMaximumHandler()];

    main(players);
}

run(process.argv);
