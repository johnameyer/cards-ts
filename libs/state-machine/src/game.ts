import { StatefulControllers } from './util.js';
import { MachineLike, NestedMachine, Transition } from './machine.js';

// TODO how does this outer level look?
/**
 * Generates the top level machine using the start / end states currently expected by the framework with game state transitions
 * @param start The logic to run once at the start of the game
 * @param loop The logic to run the core of the game
 * @param end The logic to run at the end of the game
 * @returns The machine
 */
export function game<T extends StatefulControllers>(start: MachineLike<T> | undefined, loop: MachineLike<T>, end: Transition<T> | undefined): NestedMachine<T> {
    return {
        start: 'START_GAME',
        states: {
            START_GAME: {
                run: start,
                defaultTransition: 'GAME',
            },
            GAME: {
                run: loop,
                defaultTransition: 'END_GAME',
            },
            END_GAME: {
                run: controllers => {
                    if(end) {
                        end(controllers);
                    }
                    controllers.completed.complete();
                },
            },
        },
    };
}
