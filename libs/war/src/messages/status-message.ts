import { FlippedMessage, GameOverMessage, OutOfCardsMessage, StalemateMessage, WonBattleMessage, WonWarMessage } from './status/index.js';

export type StatusMessage = FlippedMessage | GameOverMessage | OutOfCardsMessage | StalemateMessage | WonBattleMessage | WonWarMessage;
