import { IncrementalIntermediary, InquirerPresenter } from "@cards-ts/core";
import { argv } from "yargs";
import { IntermediaryHandler, defaultParams, GameDriver } from ".";
import { GameState } from "./game-state";
import { HeuristicHandler } from "./handlers/heuristic-handler";
import { ResponseMessage } from "./messages/response-message";
import { ResponseValidator } from "./response-validator";
import { StateTransformer } from "./state-transformer";

(async function() {
    const mainPlayer = new IntermediaryHandler(new IncrementalIntermediary(new InquirerPresenter()));
    let names: string[] = [];
    let name: string = argv.name as string;
    if(!argv.name) {        
        // await mainPlayer.askForName();
        name = 'Jerome';
    }
    names.push(name);
    names.push('Greg', 'Hugh', 'Leah');
    
    const players = Array(argv.players as number + 1);
    players[0] = mainPlayer, 0;
    for(let i = 1; i < players.length; i++) {
        players[i] = new HeuristicHandler();
    }
    
    // Receive the event
    const incomingEvent = {} as ResponseMessage;
    const sourceHandler = 0;

    const stateTransformer = new StateTransformer();
    const responseValidator = new ResponseValidator();
    
    // Load the old state
    const currentState = stateTransformer.initialState({ names, gameParams: defaultParams });
    
    // ??? Check the event
    const validatedEvent = responseValidator.validate(currentState, sourceHandler, incomingEvent);
    
    if(!validatedEvent) {
        throw new Error('Received invalid event: ' + JSON.stringify(incomingEvent));
    }
    
    // Merge the data from the event
    const [shouldContinue, updatedState] = stateTransformer.merge(currentState, sourceHandler, validatedEvent);


    //preserve state
    
    if(!shouldContinue) {
        return;
    }

    // Create the driver
    const driver = new GameDriver(players, updatedState, stateTransformer);
    
    // Play through all of synchronous actions
    const result = driver.resume();
    // ??? use noAwait to resolve items in the array that are not async
    // Optionally await this and receive the new event, or wait/timeout and make sure outgoing data
    
    // Make sure all the outgoing data goes out
    // await driver.handleOutgoing();
    
    
    
    // TODO how would Promise.all() events or Promise.race() events look? is that at another level of the program?
})();