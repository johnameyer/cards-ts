import { cloneArray, cloneNumber, cloneObject, cloneString } from '../cloners.js';
import { buildValidatedMessage, props } from '../message.js';

/**
 * Class denoting to handlers that the round has ended
 * @category Message
 * @class
 */
export const EndRoundMessage = buildValidatedMessage(
    'endRound',
    props<{
        /** the players' names */
        players: string[],
        /** the cummulative scores */
        scores: number[],
    }>(),
    cloneObject({
        players: cloneArray(cloneString),
        scores: cloneArray(cloneNumber)
    }),
    ({players, scores}) => {
        const arr: string[] = [];
        for(let i = 0; i < players.length; i++) {
            arr[i] = players[i] + ': ' + scores[i];
        }
        return arr;
    },
);
