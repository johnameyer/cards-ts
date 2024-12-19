import { StartRoundMessage, PickupMessage } from './status/index.js';
import { DealerMessage, DiscardMessage, EndRoundMessage, PlayedMessage, ReshuffleMessage, OutOfCardsMessage, DealtOutMessage } from '@cards-ts/core';

export type StatusMessage = DealerMessage | PickupMessage | DealtOutMessage | DiscardMessage | EndRoundMessage | PickupMessage | PlayedMessage | ReshuffleMessage | StartRoundMessage | OutOfCardsMessage;
