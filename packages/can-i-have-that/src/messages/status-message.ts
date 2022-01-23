import { StartRoundMessage } from './status';
import { DealerMessage, DiscardMessage, EndRoundMessage, PickupMessage, PlayedMessage, ReshuffleMessage, OutOfCardsMessage, DealtOutMessage } from '@cards-ts/core';

export type StatusMessage = DealerMessage | PickupMessage | DealtOutMessage | DiscardMessage | EndRoundMessage | PickupMessage | PlayedMessage | ReshuffleMessage | StartRoundMessage | OutOfCardsMessage;
