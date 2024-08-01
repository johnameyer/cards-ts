import { FlippedMessage, GameOverMessage, OutOfCardsMessage, StalemateMessage, WonBattleMessage, WonWarMessage } from './status/index.js';

export type StatusMessage = InstanceType<typeof FlippedMessage | typeof GameOverMessage | typeof OutOfCardsMessage | typeof StalemateMessage | typeof WonBattleMessage | typeof WonWarMessage>;