import { DealerMessage, DealMessage, DealOutMessage, DiscardMessage, EndRoundMessage, PickupMessage, PlayedMessage, ReshuffleMessage, StartRoundMessage } from './status';
import { OutOfCardsMessage } from './status/out-of-cards-message';

export type StatusMessage = DealerMessage | DealMessage | DealOutMessage | DiscardMessage | EndRoundMessage | PickupMessage | PlayedMessage | ReshuffleMessage | StartRoundMessage | OutOfCardsMessage;