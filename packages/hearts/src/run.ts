import { IncrementalIntermediary, InquirerPresenter } from "@cards-ts/core";
import { argv } from "yargs";
import { IntermediaryHandler, defaultParams, GameDriver } from ".";
import { GameState } from "./game-state";
import { Hand } from "./hand";
import { HeuristicHandler } from "./handlers/heuristic-handler";
import { ResponseMessage } from "./messages/response-message";
import { ResponseValidator } from "./response-validator";
import { StateTransformer } from "./state-transformer";

(async function() {
    const mainPlayer = new IntermediaryHandler(new IncrementalIntermediary(new InquirerPresenter()));
    if(!argv.name) {        
        await mainPlayer.askForName();
    } else {
        mainPlayer.setName(argv.name as string);
    }
    
    const players = Array(argv.players as number + 1);
    players[0] = new Hand(mainPlayer, 0);
    for(let i = 1; i < players.length; i++) {
        players[i] = new Hand(new HeuristicHandler(), i);
    }
    
    // Receive the event
    const incomingEvent = {} as ResponseMessage;

    const stateTransformer = new StateTransformer();
    const responseValidator = new ResponseValidator();
    
    // Load the old state
    const currentState = stateTransformer.initialState({ numPlayers: players.length, gameParams: defaultParams });
    
    // ??? Check the event
    const validatedEvent = responseValidator.validate(currentState, incomingEvent);
    
    if(!validatedEvent) {
        throw new Error('Received invalid event: ' + JSON.stringify(incomingEvent));
    }
    
    // Merge the data from the event
    const updatedState = stateTransformer.merge(currentState, validatedEvent);
    
    // Create the driver
    const driver = new GameDriver(players, updatedState);
    
    // Play through all of synchronous actions
    driver.resume();
    // ??? If the checks were done inside of the handler_event function it would be unable to roll back
    // ??? use noAwait to resolve items in the array that are not async
    // Optionally await this and receive the new event, or wait/timeout and make sure outgoing data
    
    // Make sure all the outgoing data goes out
    await driver.handleOutgoing();
    
    
    
    // TODO how would Promise.all() events or Promise.race() events look? is that at another level of the program?
})();