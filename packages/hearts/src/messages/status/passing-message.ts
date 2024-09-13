import { Message, Presentable } from '@cards-ts/core';

function generateMessage(numToPass: number, passing: number, numPlayers: number): Presentable[] {
    if (passing === numPlayers / 2) {
        return ['Passing', numToPass, 'cards across'];
    } else if (passing < 0) {
        return ['Passing', numToPass, 'cards', -passing, 'to the left'];
    }
    return ['Passing', numToPass, 'cards', passing, 'to the right'];
}

/**
 * Class that denotes to a handler that they need to pass a number of cards
 * Note that this information is also passed in the handler and mostly meant for display purposes
 */
export class PassingMessage extends Message {
    public readonly type = 'passing-message';

    /**
     * @param numToPass the number of cards to pass
     * @param passing who is being passed to, with 0 being the player and positive being the right
     * @param numPlayers the number of players
     */
    constructor(public readonly numToPass: number, public readonly passing: number, public readonly numPlayers: number) {
        super(generateMessage(numToPass, passing, numPlayers));
    }
}
