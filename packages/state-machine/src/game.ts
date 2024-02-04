import { MachineLike, NestedMachine, StatefulControllers, Transition } from './util.js';

// TODO how does this outer level look?
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
