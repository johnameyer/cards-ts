import { Message, Presentable } from '@cards-ts/core';

function generateMessage(shooter: string): Presentable[] {
    return [ shooter, 'shot the moon' ];
}

/**
 * Class that denotes to a handler that a player has shot the moon
 */
export class ShotTheMoonMessage extends Message {
    
    public readonly type = 'shot-the-moon-message';

    /**
     * @param shooter the hand that shot the moon
     */
    constructor(public readonly shooter: string) {
        super(generateMessage(shooter));
    }
}
