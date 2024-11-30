import { DealerMessage, PickupMessage as PublicPickupMessage, DealtOutMessage, DiscardMessage, EndRoundMessage, PlayedOnMeldMessage, ReshuffleMessage, OutOfCardsMessage } from "@cards-ts/core";
import { StartRoundMessage } from "./start-round-message.js";
import { PickupMessage } from "./pickup-message.js";

export { DealerMessage, PickupMessage, DealtOutMessage, DiscardMessage, EndRoundMessage, PublicPickupMessage, PlayedOnMeldMessage, ReshuffleMessage, StartRoundMessage, OutOfCardsMessage }

export type StatusMessage = typeof DealerMessage | PickupMessage | typeof DealtOutMessage | typeof DiscardMessage | typeof EndRoundMessage | PublicPickupMessage | typeof PlayedOnMeldMessage | typeof ReshuffleMessage | StartRoundMessage | typeof OutOfCardsMessage;