import { GameStates } from "../game-states";
import { GameParams } from "../game-params";
import { CanIHaveThatControllerProvider } from "./can-i-have-that-controller";
import { GameHandlerParams } from "../game-handler-params";
import { ResponseMessage } from "../messages/response-message";
import { DefaultControllers, SystemHandlerParams, DeckControllerProvider, PointsControllerProvider, TurnControllerProvider, MeldControllerProvider, DefaultControllerKeys, ValidatedProviders, HandsControllerProvider, ControllersProviders, UnwrapProviders } from "@cards-ts/core";

type TypedDefaultControllers = DefaultControllers<GameParams, typeof GameStates, ResponseMessage, GameHandlerParams & SystemHandlerParams>;

export const buildProviders = () => {
    const providers = {
        deck: new DeckControllerProvider(3, true),
        hand: new HandsControllerProvider(),
        score: new PointsControllerProvider(),
        turn: new TurnControllerProvider(),
        ask: new TurnControllerProvider(),
        melds: new MeldControllerProvider(),
        canIHaveThat: new CanIHaveThatControllerProvider()
    };

    return providers as Omit<ValidatedProviders<typeof providers & ControllersProviders<TypedDefaultControllers>>, DefaultControllerKeys>;
};

export type GameControllers = UnwrapProviders<ReturnType<typeof buildProviders>>;

export type Controllers = GameControllers & TypedDefaultControllers;