import { DealerMessage, DiscardMessage, EndRoundMessage, PickupMessage, PlayedMessage, ReshuffleMessage, OutOfCardsMessage, DealtOutMessage } from "@cards-ts/core";
import { StartRoundMessage } from "./status";

export type StatusMessage = DealerMessage | PickupMessage | DealtOutMessage | DiscardMessage | EndRoundMessage | PickupMessage | PlayedMessage | ReshuffleMessage | StartRoundMessage | OutOfCardsMessage;