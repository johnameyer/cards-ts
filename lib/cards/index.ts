import { main } from './main';
import { ConsoleHandler } from './console-handler';
import { GrammyHandler } from './grammy-handler';

async function run(argv: string[]) {
    const mainPlayer = new ConsoleHandler();
    await mainPlayer.askForName();

    const players = [mainPlayer, new GrammyHandler(), new GrammyHandler()];

    main(players);
}

run(process.argv);
