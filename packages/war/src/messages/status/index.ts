import { OutOfCardsMessage } from '@cards-ts/core';
import { FlippedMessage } from './flipped-message.js';
import { GameOverMessage } from './game-over-message.js';
import { StalemateMessage } from './stalemate-message.js';
import { WonBattleMessage } from './won-battle-message.js';
import { WonWarMessage } from './won-war-message.js';

export { FlippedMessage, GameOverMessage, OutOfCardsMessage, StalemateMessage, WonBattleMessage, WonWarMessage };

export type StatusMessage = InstanceType<typeof FlippedMessage | typeof GameOverMessage | typeof OutOfCardsMessage | typeof StalemateMessage | typeof WonBattleMessage | typeof WonWarMessage>;