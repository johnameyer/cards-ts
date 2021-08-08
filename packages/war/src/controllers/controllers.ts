import { HiddenHandsControllerProvider, DefaultControllerKeys, DefaultControllers, SystemHandlerParams, DeckControllerProvider, ControllersProviders, UnwrapProviders, ValidatedProviders } from "@cards-ts/core";
import { GameStates } from "../game-states";
import { GameParams } from "../game-params";
import { WarControllerProvider } from "./war-controller";
import { GameHandlerParams } from "../game-handler-params";
import { ResponseMessage } from "../messages/response-message";

type TypedDefaultControllers = DefaultControllers<GameParams, typeof GameStates, ResponseMessage, GameHandlerParams & SystemHandlerParams>;

export const buildProviders = () => {
    const providers = {
        deck: new DeckControllerProvider(1, true, false),
        hand: new HiddenHandsControllerProvider(),
        war: new WarControllerProvider()
    };
    return providers as Omit<ValidatedProviders<typeof providers & ControllersProviders<TypedDefaultControllers>>, DefaultControllerKeys>;
};

export type GameControllers = UnwrapProviders<ReturnType<typeof buildProviders>>;

export type Controllers = GameControllers & TypedDefaultControllers;