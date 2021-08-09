import { FlippedMessage, GameOverMessage, OutOfCardsMessage, StalemateMessage, WonBattleMessage, WonWarMessage } from './status';

export type StatusMessage = FlippedMessage | GameOverMessage | OutOfCardsMessage | StalemateMessage | WonBattleMessage | WonWarMessage;
